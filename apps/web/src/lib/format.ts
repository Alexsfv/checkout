import {
  CURRENCY_SYMBOL,
  DECIMAL_SEPARATOR,
  DEFAULT_CURRENCY,
  DIGIT_GROUP_SIZE,
  FREE_SHIPPING_LABEL,
  ITEM_FORMS,
  MINOR_UNITS_IN_MAJOR,
  MONTHS_GENITIVE,
  THOUSANDS_SEPARATOR,
} from './constants';
import type { PluralForms } from './types';

const padTwo = (value: number): string => String(value).padStart(2, '0');

const groupDigits = (value: number): string => {
  const digits = String(value);
  let result = '';
  for (let index = 0; index < digits.length; index += 1) {
    const tail = digits.length - index;
    result += digits[index];
    if (tail > 1 && tail % DIGIT_GROUP_SIZE === 1) result += THOUSANDS_SEPARATOR;
  }
  return result;
};

export const formatMoney = (minorUnits: number, currency = DEFAULT_CURRENCY): string => {
  const total = Math.abs(Math.round(minorUnits));
  const major = Math.trunc(total / MINOR_UNITS_IN_MAJOR);
  const minor = total % MINOR_UNITS_IN_MAJOR;
  const sign = minorUnits < 0 ? '-' : '';
  const fraction = minor === 0 ? '' : `${DECIMAL_SEPARATOR}${padTwo(minor)}`;
  const symbol = CURRENCY_SYMBOL[currency] ?? currency;
  return `${sign}${groupDigits(major)}${fraction}${THOUSANDS_SEPARATOR}${symbol}`;
};

export const plural = (count: number, forms: PluralForms): string => {
  const tens = Math.abs(count) % 100;
  const units = tens % 10;
  if (tens > 10 && tens < 20) return forms.many;
  if (units === 1) return forms.one;
  if (units >= 2 && units <= 4) return forms.few;
  return forms.many;
};

export const formatCount = (count: number, forms: PluralForms): string =>
  `${count} ${plural(count, forms)}`;

export const formatItems = (quantity: number): string => formatCount(quantity, ITEM_FORMS);

export const formatShipping = (minorUnits: number, currency = DEFAULT_CURRENCY): string =>
  minorUnits === 0 ? FREE_SHIPPING_LABEL : formatMoney(minorUnits, currency);

export const formatDateTime = (iso: string): string => {
  const date = new Date(iso);
  const month = MONTHS_GENITIVE[date.getMonth()] ?? '';
  return `${date.getDate()} ${month} в ${padTwo(date.getHours())}:${padTwo(date.getMinutes())}`;
};
