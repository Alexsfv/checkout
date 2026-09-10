import type { AppError } from './errors';

export type ErrorKind = 'network' | 'timeout' | 'aborted' | 'http' | 'parse';

export interface FieldIssue {
  path: string;
  message: string;
}

export interface AppErrorInit {
  kind: ErrorKind;
  message: string;
  status?: number;
  code?: string;
  fields?: FieldIssue[];
  requestId?: string;
  retryAfterMs?: number;
  cause?: unknown;
}

export interface ErrorView {
  title: string;
  description?: string;
  retriable: boolean;
  code?: string;
  requestId?: string;
}

export type ErrorText = Omit<ErrorView, 'retriable'> & { retriable?: boolean };

export interface TransportRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: string;
  signal?: AbortSignal;
  retriable: boolean;
  timeoutMs?: number;
}

export type Transport = (request: TransportRequest) => Promise<Response>;

export interface RetryPolicy {
  attempts: number;
  delayMs: (attempt: number) => number;
}

export type PayloadParser = (body: unknown, response: Response) => unknown;

export interface ErrorContext {
  status: number;
  body: unknown;
  response: Response;
}

export type ErrorParser = (context: ErrorContext) => AppError;

export interface Envelope {
  data: unknown;
  meta?: { requestId?: string };
  links?: Record<string, { href: string; method: string }>;
}

export interface ApiErrorBody {
  error: { code?: string; message?: string; fields?: FieldIssue[] };
  meta?: { requestId?: string };
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';

export type QueryParams = Record<string, string | number | undefined>;

export interface HeaderContext {
  method: HttpMethod;
  path: string;
  auth: boolean;
}

export type HeaderProvider = (
  context: HeaderContext,
) =>
  | Promise<Record<string, string | undefined> | undefined>
  | Record<string, string | undefined>
  | undefined;

export interface HttpRequest {
  method: HttpMethod;
  path: string;
  query?: QueryParams;
  body?: unknown;
  rawBody?: string;
  headers?: Record<string, string | undefined>;
  signal?: AbortSignal;
  timeoutMs?: number;
  auth?: boolean;
  idempotent?: boolean;
  idempotencyKey?: string;
  ifMatch?: string;
  ifNoneMatch?: string;
}

export type RequestOptions = Omit<HttpRequest, 'method' | 'path' | 'body'>;

export interface HttpResult<T> {
  data: T;
  status: number;
  headers: Headers;
  etag: string | null;
  location: string | null;
  retryAfterMs: number | null;
  requestId: string | null;
}

export interface HttpClientConfig {
  baseUrl: string;
  headers?: HeaderProvider[];
  transport?: Transport;
  payload?: PayloadParser;
  error?: ErrorParser;
  onUnauthorized?: (error: AppError) => Promise<boolean>;
  timeoutMs?: number;
  retryAttempts?: number;
}

export interface HttpClient {
  request<T>(request: HttpRequest): Promise<HttpResult<T>>;
  get<T>(path: string, options?: RequestOptions): Promise<HttpResult<T>>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<HttpResult<T>>;
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<HttpResult<T>>;
  del<T>(path: string, options?: RequestOptions): Promise<HttpResult<T>>;
}

export interface IdempotencySlot {
  key: string;
  fingerprint: string;
}

export interface IdempotencyStore {
  keyFor(scope: string, fingerprint: unknown): string;
  rotate(scope: string): void;
  release(scope: string): void;
  clear(): void;
}
