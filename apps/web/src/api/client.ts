import { API_URL, IDEMPOTENCY_STORAGE_KEY } from './constants';
import { createHttpClient } from './http/client';
import { createIdempotencyStore } from './http/idempotency';
import { envelopePayload, parseApiError } from './http/parse';
import { ensureSession, resetSession } from './session';
import type { SessionData } from './types';

export const http = createHttpClient({
  baseUrl: API_URL,
  headers: [
    () => ({ Accept: 'application/json' }),
    async (context) =>
      context.auth ? { Authorization: `Bearer ${await ensureSession(createSession)}` } : undefined,
  ],
  payload: envelopePayload,
  error: parseApiError,
  onUnauthorized: async () => {
    resetSession();
    return true;
  },
});

const createSession = async (): Promise<SessionData> => {
  const result = await http.post<SessionData>('/api/sessions', {}, { auth: false });
  return result.data;
};

export const idempotency = createIdempotencyStore(IDEMPOTENCY_STORAGE_KEY);
