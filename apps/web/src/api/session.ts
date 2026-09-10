import { create } from 'zustand';
import { readStored, removeStored, writeStored } from '@/lib/storage';
import { SESSION_STORAGE_KEY } from './constants';
import type { SessionData, SessionState, StoredSession } from './types';

export const useSessionStore = create<SessionState>(() => ({ token: null, sessionId: null }));

let hydrated = false;
let inflight: Promise<string> | null = null;

const hydrate = (): void => {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  const stored = readStored<StoredSession | null>(SESSION_STORAGE_KEY, null);
  if (stored) useSessionStore.setState({ token: stored.token, sessionId: stored.id });
};

const remember = (session: StoredSession): void => {
  writeStored(SESSION_STORAGE_KEY, session);
  useSessionStore.setState({ token: session.token, sessionId: session.id });
};

export const hydrateSession = (): void => {
  hydrate();
};

export const ensureSession = (createSession: () => Promise<SessionData>): Promise<string> => {
  hydrate();
  const token = useSessionStore.getState().token;
  if (token) return Promise.resolve(token);
  inflight ??= createSession()
    .then((session) => {
      remember({ id: session.id, token: session.token });
      return session.token;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
};

export const resetSession = (): void => {
  removeStored(SESSION_STORAGE_KEY);
  useSessionStore.setState({ token: null, sessionId: null });
  inflight = null;
};
