export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export const SESSION_STORAGE_KEY = 'checkout.session.v1';

export const IDEMPOTENCY_STORAGE_KEY = 'checkout.idempotency.v1';

export const TERMINAL_PAYMENT_STATUS: ReadonlySet<string> = new Set([
  'succeeded',
  'failed',
  'cancelled',
]);

export const ACTIVE_PAYMENT_STATUS: ReadonlySet<string> = new Set(['pending', 'processing']);

export const PAYMENT_POLL_MS = 700;

export const CATALOG_STALE_MS = 5 * 60_000;

export const ORDERS_STALE_MS = 30_000;

export const QUOTE_STALE_MS = 8 * 60_000;

export const QUOTE_GC_MS = 10 * 60_000;
