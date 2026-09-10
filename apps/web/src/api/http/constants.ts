export const RETRIABLE_STATUS: ReadonlySet<number> = new Set([408, 425, 429, 500, 502, 503, 504]);

export const EMPTY_BODY_STATUS: ReadonlySet<number> = new Set([204, 304]);

export const DEFAULT_TIMEOUT_MS = 15_000;

export const DEFAULT_RETRY_ATTEMPTS = 2;

export const RETRY_BASE_DELAY_MS = 250;

export const SAFE_METHODS: ReadonlySet<string> = new Set(['GET', 'HEAD']);
