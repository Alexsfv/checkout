import { RETRIABLE_STATUS } from './constants';
import { AppError, isAppError } from './errors';
import type { RetryPolicy, Transport, TransportRequest } from './types';
import { aborted, sleep } from './utils';

const timeoutError = (request: TransportRequest): AppError =>
  new AppError({
    kind: 'timeout',
    message: `Таймаут запроса ${request.method} ${request.url}`,
  });

const describeTransportFailure = (cause: unknown, request: TransportRequest): AppError => {
  if (isAppError(cause)) return cause;
  if (cause instanceof Error && cause.name === 'AbortError') return aborted();
  return new AppError({
    kind: 'network',
    message: `Не удалось выполнить запрос ${request.method} ${request.url}`,
    cause,
  });
};

export const createFetchTransport = (fetchImpl?: typeof fetch): Transport => {
  const send: typeof fetch = fetchImpl ?? ((input, init) => globalThis.fetch(input, init));

  return async (request) => {
    try {
      return await send(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        signal: request.signal,
        cache: 'no-store',
        credentials: 'omit',
      });
    } catch (cause) {
      throw describeTransportFailure(cause, request);
    }
  };
};

export const withTimeout =
  (next: Transport, defaultMs: number): Transport =>
  (request) => {
    const ms = request.timeoutMs ?? defaultMs;
    if (!Number.isFinite(ms) || ms <= 0) return next(request);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(timeoutError(request)), ms);
    const forwardAbort = () => controller.abort(request.signal?.reason);
    request.signal?.addEventListener('abort', forwardAbort, { once: true });

    return next({ ...request, signal: controller.signal }).finally(() => {
      clearTimeout(timer);
      request.signal?.removeEventListener('abort', forwardAbort);
    });
  };

export const withRetry =
  (next: Transport, policy: RetryPolicy): Transport =>
  async (request) => {
    let lastError: unknown;
    for (let attempt = 0; attempt <= policy.attempts; attempt += 1) {
      if (attempt > 0) {
        if (!request.retriable) break;
        await sleep(policy.delayMs(attempt), request.signal);
      }
      try {
        const response = await next(request);
        const giveUp = attempt === policy.attempts || !request.retriable;
        if (!RETRIABLE_STATUS.has(response.status) || giveUp) return response;
        lastError = undefined;
      } catch (error) {
        if (isAppError(error) && error.kind === 'aborted') throw error;
        if (attempt === policy.attempts || !request.retriable) throw error;
        lastError = error;
      }
    }
    throw lastError ?? new AppError({ kind: 'network', message: 'Запрос не удалось выполнить' });
  };
