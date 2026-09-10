import { readStored, removeStored, writeStored } from '@/lib/storage';
import { stableStringify, uuid } from '@/lib/uuid';
import type { IdempotencySlot, IdempotencyStore } from './types';

export const createIdempotencyStore = (storageKey: string): IdempotencyStore => {
  let slots = readStored<Record<string, IdempotencySlot>>(storageKey, {});

  const persist = () => writeStored(storageKey, slots);

  return {
    keyFor(scope, fingerprint) {
      const stamp = stableStringify(fingerprint);
      const current = slots[scope];
      if (current && current.fingerprint === stamp) return current.key;
      const slot: IdempotencySlot = { key: uuid(), fingerprint: stamp };
      slots = { ...slots, [scope]: slot };
      persist();
      return slot.key;
    },
    rotate(scope) {
      if (!slots[scope]) return;
      const { [scope]: _removed, ...rest } = slots;
      slots = rest;
      persist();
    },
    release(scope) {
      this.rotate(scope);
    },
    clear() {
      slots = {};
      removeStored(storageKey);
    },
  };
};
