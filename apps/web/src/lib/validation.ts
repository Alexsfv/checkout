import type { Rule } from './types';

export const required =
  <V>(message = 'Заполните поле'): Rule<V> =>
  (value) =>
    value.trim().length === 0 ? message : undefined;

export const minLength =
  <V>(length: number, message = `Не короче ${length} символов`): Rule<V> =>
  (value) =>
    value.trim().length > 0 && value.trim().length < length ? message : undefined;

export const maxLength =
  <V>(length: number, message = `Не длиннее ${length} символов`): Rule<V> =>
  (value) =>
    value.trim().length > length ? message : undefined;

export const matches =
  <V>(pattern: RegExp, message: string): Rule<V> =>
  (value) =>
    value.trim().length > 0 && !pattern.test(value.trim()) ? message : undefined;

export const all =
  <V>(...rules: Array<Rule<V>>): Rule<V> =>
  (value, values) => {
    for (const rule of rules) {
      const error = rule(value, values);
      if (error) return error;
    }
    return undefined;
  };
