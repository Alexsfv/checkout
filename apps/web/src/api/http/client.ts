import { DEFAULT_RETRY_ATTEMPTS, DEFAULT_TIMEOUT_MS, RETRY_BASE_DELAY_MS } from './constants';
import { envelopePayload, parseApiError, readBody, retryAfterMs } from './parse';
import { createFetchTransport, withRetry, withTimeout } from './transport';
import type { HttpClient, HttpClientConfig, HttpRequest, HttpResult } from './types';
import { buildUrl, isRetriable } from './utils';

export const createHttpClient = (config: HttpClientConfig): HttpClient => {
  const transport =
    config.transport ??
    withRetry(withTimeout(createFetchTransport(), config.timeoutMs ?? DEFAULT_TIMEOUT_MS), {
      attempts: config.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS,
      delayMs: (attempt) => RETRY_BASE_DELAY_MS * 2 ** (attempt - 1),
    });
  const parsePayload = config.payload ?? envelopePayload;
  const parseError = config.error ?? parseApiError;

  const collectHeaders = async (request: HttpRequest): Promise<Record<string, string>> => {
    const headers: Record<string, string> = {};
    const put = (source?: Record<string, string | undefined>) => {
      if (!source) return;
      for (const [key, value] of Object.entries(source)) {
        if (value !== undefined) headers[key] = value;
      }
    };

    for (const provider of config.headers ?? []) {
      put(
        await provider({
          method: request.method,
          path: request.path,
          auth: request.auth !== false,
        }),
      );
    }
    put({
      'Idempotency-Key': request.idempotencyKey,
      'If-Match': request.ifMatch,
      'If-None-Match': request.ifNoneMatch,
    });
    put(request.headers);
    return headers;
  };

  const execute = async <T>(
    request: HttpRequest,
    allowAuthRetry: boolean,
  ): Promise<HttpResult<T>> => {
    const body =
      request.rawBody ?? (request.body === undefined ? undefined : JSON.stringify(request.body));
    const headers = await collectHeaders(request);
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await transport({
      url: buildUrl(config.baseUrl, request.path, request.query),
      method: request.method,
      headers,
      body,
      signal: request.signal,
      retriable: isRetriable(request),
      timeoutMs: request.timeoutMs,
    });

    const raw = await readBody(response);
    if (!response.ok) {
      const error = parseError({ status: response.status, body: raw, response });
      if (response.status === 401 && allowAuthRetry && config.onUnauthorized) {
        if (await config.onUnauthorized(error)) return execute<T>(request, false);
      }
      throw error;
    }

    return {
      data: parsePayload(raw, response) as T,
      status: response.status,
      headers: response.headers,
      etag: response.headers.get('etag'),
      location: response.headers.get('location'),
      retryAfterMs: retryAfterMs(response) ?? null,
      requestId: response.headers.get('x-request-id'),
    };
  };

  const request = <T>(input: HttpRequest) => execute<T>(input, true);

  return {
    request,
    get: (path, options) => request({ ...options, method: 'GET', path }),
    post: (path, body, options) => request({ ...options, method: 'POST', path, body }),
    put: (path, body, options) => request({ ...options, method: 'PUT', path, body }),
    del: (path, options) => request({ ...options, method: 'DELETE', path }),
  };
};
