export const cn = (...values: unknown[]): string => {
  return values.reduce<string>(
    (acc, value) => (typeof value === 'string' && value ? (acc ? `${acc} ${value}` : value) : acc),
    '',
  );
};
