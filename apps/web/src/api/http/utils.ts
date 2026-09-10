import { SAFE_METHODS } from './constants';
import { AppError } from './errors';
import type { HttpRequest, QueryParams } from './types';

export const isRetriable = (request: HttpRequest): boolean => {
  if (request.idempotent !== undefined) return request.idempotent;
  if (request.method === 'POST') return request.idempotencyKey !== undefined;
  return true;
};

export const isSafeMethod = (method: string): boolean => {
  return SAFE_METHODS.has(method);
};

export const buildUrl = (baseUrl: string, path: string, query?: QueryParams): string => {
  const url = `${baseUrl}${path}`;
  if (!query) return url;
  const search = Object.entries(query).reduce((params, [key, value]) => {
    if (value !== undefined) params.append(key, String(value));
    return params;
  }, new URLSearchParams());
  const suffix = search.toString();
  return suffix ? `${url}?${suffix}` : url;
};

export const sleep = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(aborted());
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(aborted());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
};

export const aborted = (): AppError => {
  return new AppError({ kind: 'aborted', message: 'Запрос отменён' });
};
