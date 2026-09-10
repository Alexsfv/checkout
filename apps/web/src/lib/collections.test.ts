import { describe, expect, it } from 'vitest';
import { indexBy } from './collections';

describe('indexBy', () => {
  it('строит карту за один проход', () => {
    const index = indexBy(
      [
        { id: 'a', n: 1 },
        { id: 'b', n: 2 },
      ],
      (item) => item.id,
    );
    expect(index.get('b')?.n).toBe(2);
    expect(index.size).toBe(2);
  });

  it('последний элемент с тем же ключом побеждает', () => {
    const index = indexBy(
      [
        { id: 'a', n: 1 },
        { id: 'a', n: 2 },
      ],
      (item) => item.id,
    );
    expect(index.get('a')?.n).toBe(2);
  });

  it('undefined даёт пустую карту', () => {
    expect(indexBy(undefined, (item: { id: string }) => item.id).size).toBe(0);
  });
});
