import type { PluralForms } from './types';

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PHONE_PATTERN = /^\+[1-9]\d{9,14}$/;

export const DEFAULT_CURRENCY = 'RUB';

export const CURRENCY_SYMBOL: Record<string, string> = { RUB: '₽' };

export const MINOR_UNITS_IN_MAJOR = 100;

export const DIGIT_GROUP_SIZE = 3;

export const THOUSANDS_SEPARATOR = ' ';

export const DECIMAL_SEPARATOR = ',';

export const ITEM_FORMS: PluralForms = { one: 'товар', few: 'товара', many: 'товаров' };

export const MONTHS_GENITIVE: readonly string[] = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];

export const FREE_SHIPPING_LABEL = 'Бесплатно';
