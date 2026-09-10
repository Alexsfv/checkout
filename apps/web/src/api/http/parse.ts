import { EMPTY_BODY_STATUS } from './constants';
import { AppError } from './errors';
import type { ApiErrorBody, Envelope, ErrorParser, PayloadParser } from './types';

export const readBody = async (response: Response): Promise<unknown> => {
  if (EMPTY_BODY_STATUS.has(response.status)) return undefined;
  const type = response.headers.get('content-type') ?? '';
  const text = await response.text();
  if (text.length === 0) return undefined;
  if (!type.includes('json')) return text;
  try {
    return JSON.parse(text) as unknown;
  } catch (cause) {
    throw new AppError({
      kind: 'parse',
      status: response.status,
      message: 'Сервер вернул не JSON',
      cause,
    });
  }
};

const isEnvelope = (body: unknown): body is Envelope => {
  return typeof body === 'object' && body !== null && 'data' in body && 'meta' in body;
};

const isErrorBody = (body: unknown): body is ApiErrorBody => {
  return typeof body === 'object' && body !== null && 'error' in body;
};

export const envelopePayload: PayloadParser = (body) => (isEnvelope(body) ? body.data : body);

export const barePayload: PayloadParser = (body) => body;

export const parseApiError: ErrorParser = ({ status, body, response }) => {
  const payload = isErrorBody(body) ? body.error : undefined;
  return new AppError({
    kind: 'http',
    status,
    code: payload?.code,
    message: payload?.message ?? `HTTP ${status}`,
    fields: payload?.fields,
    requestId: response.headers.get('x-request-id') ?? undefined,
    retryAfterMs: retryAfterMs(response),
  });
};

export const retryAfterMs = (response: Response): number | undefined => {
  const header = response.headers.get('retry-after');
  if (!header) return undefined;
  const seconds = Number(header);
  return Number.isFinite(seconds) ? Math.max(0, seconds) * 1000 : undefined;
};
