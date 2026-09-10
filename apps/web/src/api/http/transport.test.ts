import { describe, expect, it, vi } from 'vitest';
import { AppError } from './errors';
import { withRetry } from './transport';
import type { Transport, TransportRequest } from './types';

const request = (over: Partial<TransportRequest> = {}): TransportRequest => ({
  url: 'http://localhost/api/test',
  method: 'GET',
  headers: {},
  retriable: true,
  ...over,
});

const ok = () =>
  new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
const fail = (status: number) =>
  new Response('{}', { status, headers: { 'content-type': 'application/json' } });

const policy = { attempts: 2, delayMs: () => 0 };

describe('withRetry', () => {
  it('повторяет сетевой сбой и возвращает успешный ответ', async () => {
    const inner = vi
      .fn<Transport>()
      .mockRejectedValueOnce(new AppError({ kind: 'network', message: 'нет связи' }))
      .mockResolvedValueOnce(ok());

    const response = await withRetry(inner, policy)(request());
    expect(response.status).toBe(200);
    expect(inner).toHaveBeenCalledTimes(2);
  });

  it('повторяет 503 и отдаёт последний ответ, если сервер так и не ожил', async () => {
    const inner = vi.fn<Transport>().mockResolvedValue(fail(503));
    const response = await withRetry(inner, policy)(request());
    expect(response.status).toBe(503);
    expect(inner).toHaveBeenCalledTimes(3);
  });

  it('не повторяет 409 — повтор даст тот же ответ', async () => {
    const inner = vi.fn<Transport>().mockResolvedValue(fail(409));
    await withRetry(inner, policy)(request());
    expect(inner).toHaveBeenCalledTimes(1);
  });

  it('не повторяет запрос, помеченный как неидемпотентный', async () => {
    const inner = vi
      .fn<Transport>()
      .mockRejectedValue(new AppError({ kind: 'network', message: 'нет связи' }));
    await expect(
      withRetry(inner, policy)(request({ method: 'POST', retriable: false })),
    ).rejects.toThrow();
    expect(inner).toHaveBeenCalledTimes(1);
  });

  it('не повторяет отменённый запрос', async () => {
    const inner = vi
      .fn<Transport>()
      .mockRejectedValue(new AppError({ kind: 'aborted', message: 'отменён' }));
    await expect(withRetry(inner, policy)(request())).rejects.toMatchObject({ kind: 'aborted' });
    expect(inner).toHaveBeenCalledTimes(1);
  });
});
