export const indexBy = <T, K>(
  items: readonly T[] | undefined,
  key: (item: T) => K,
): ReadonlyMap<K, T> => {
  const index = new Map<K, T>();
  if (!items) return index;
  for (const item of items) index.set(key(item), item);
  return index;
};
