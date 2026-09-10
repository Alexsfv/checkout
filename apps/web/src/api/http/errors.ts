import type { AppErrorInit, ErrorKind, FieldIssue } from './types';

export class AppError extends Error {
  readonly kind: ErrorKind;
  readonly status?: number;
  readonly code?: string;
  readonly fields?: FieldIssue[];
  readonly requestId?: string;
  readonly retryAfterMs?: number;

  constructor(init: AppErrorInit) {
    super(init.message, { cause: init.cause });
    this.name = 'AppError';
    this.kind = init.kind;
    this.status = init.status;
    this.code = init.code;
    this.fields = init.fields;
    this.requestId = init.requestId;
    this.retryAfterMs = init.retryAfterMs;
  }
}

export const isAppError = (value: unknown): value is AppError => {
  return value instanceof AppError;
};

export const isAbort = (value: unknown): boolean => {
  return isAppError(value) && value.kind === 'aborted';
};

export const hasCode = (value: unknown, ...codes: string[]): boolean => {
  return isAppError(value) && value.code !== undefined && codes.includes(value.code);
};

export const toAppError = (value: unknown): AppError => {
  if (isAppError(value)) return value;
  if (value instanceof Error) {
    return new AppError({ kind: 'parse', message: value.message, cause: value });
  }
  return new AppError({ kind: 'parse', message: String(value), cause: value });
};
