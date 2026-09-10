import { beforeEach, describe, expect, it } from 'vitest';
import { createIdempotencyStore } from './idempotency';

describe('createIdempotencyStore', () => {
  let store = createIdempotencyStore('test');

  beforeEach(() => {
    store = createIdempotencyStore('test');
  });

  it('на одинаковое тело выдаёт один и тот же ключ', () => {
    const body = { quoteId: 'q1', paymentMethod: 'card' };
    expect(store.keyFor('order', body)).toBe(store.keyFor('order', body));
  });

  it('порядок полей в теле не влияет на ключ', () => {
    const first = store.keyFor('order', { a: 1, b: { c: 2, d: 3 } });
    const second = store.keyFor('order', { b: { d: 3, c: 2 }, a: 1 });
    expect(first).toBe(second);
  });

  it('изменившееся тело получает новый ключ', () => {
    const first = store.keyFor('order', { quoteId: 'q1' });
    const second = store.keyFor('order', { quoteId: 'q2' });
    expect(second).not.toBe(first);

    expect(store.keyFor('order', { quoteId: 'q1' })).not.toBe(first);
  });

  it('rotate начинает новую попытку с тем же телом', () => {
    const first = store.keyFor('payment', 'order-1');
    store.rotate('payment');
    expect(store.keyFor('payment', 'order-1')).not.toBe(first);
  });

  it('слоты независимы', () => {
    expect(store.keyFor('order', 'x')).not.toBe(store.keyFor('payment', 'x'));
  });

  it('ключ подходит под формат API: 8–128 символов из [A-Za-z0-9_-]', () => {
    const key = store.keyFor('order', {});
    expect(key).toMatch(/^[A-Za-z0-9_-]{8,128}$/);
  });
});
