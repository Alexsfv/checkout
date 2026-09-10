const area = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

export const readStored = <T>(key: string, fallback: T): T => {
  try {
    const raw = area()?.getItem(key);
    return raw === null || raw === undefined ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
};

export const writeStored = (key: string, value: unknown): void => {
  try {
    area()?.setItem(key, JSON.stringify(value));
  } catch {}
};

export const removeStored = (key: string): void => {
  try {
    area()?.removeItem(key);
  } catch {}
};
