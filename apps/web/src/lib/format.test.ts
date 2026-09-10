import { describe, expect, it } from 'vitest';
import {
  formatCount,
  formatDateTime,
  formatItems,
  formatMoney,
  formatShipping,
  plural,
} from './format';

const NBSP = ' ';

describe('formatMoney', () => {
  it('переводит копейки в рубли и разбивает разряды', () => {
    expect(formatMoney(249000)).toBe(`2${NBSP}490${NBSP}₽`);
    expect(formatMoney(89000)).toBe(`890${NBSP}₽`);
    expect(formatMoney(123456700)).toBe(`1${NBSP}234${NBSP}567${NBSP}₽`);
  });

  it('показывает копейки только когда они есть', () => {
    expect(formatMoney(249050)).toBe(`2${NBSP}490,50${NBSP}₽`);
    expect(formatMoney(249005)).toBe(`2${NBSP}490,05${NBSP}₽`);
  });

  it('обрабатывает ноль и отрицательные суммы', () => {
    expect(formatMoney(0)).toBe(`0${NBSP}₽`);
    expect(formatMoney(-39000)).toBe(`-390${NBSP}₽`);
  });

  it('незнакомую валюту показывает кодом', () => {
    expect(formatMoney(10000, 'USD')).toBe(`100${NBSP}USD`);
  });
});

describe('plural', () => {
  const forms = { one: 'товар', few: 'товара', many: 'товаров' };

  it('склоняет по правилам русского языка', () => {
    const shape = (count: number) => `${count} ${plural(count, forms)}`;
    expect([1, 2, 5, 11, 12, 14, 21, 22, 25, 101, 111, 112].map(shape)).toEqual([
      '1 товар',
      '2 товара',
      '5 товаров',
      '11 товаров',
      '12 товаров',
      '14 товаров',
      '21 товар',
      '22 товара',
      '25 товаров',
      '101 товар',
      '111 товаров',
      '112 товаров',
    ]);
  });

  it('ноль — множественное число', () => {
    expect(plural(0, forms)).toBe('товаров');
  });
});

describe('formatCount и formatItems', () => {
  it('подставляют число вместе с формой', () => {
    expect(formatCount(3, { one: 'заказ', few: 'заказа', many: 'заказов' })).toBe('3 заказа');
    expect(formatItems(1)).toBe('1 товар');
  });
});

describe('formatShipping', () => {
  it('бесплатную доставку показывает словом', () => {
    expect(formatShipping(0)).toBe('Бесплатно');
    expect(formatShipping(39000)).toBe(`390${NBSP}₽`);
  });
});

describe('formatDateTime', () => {
  it('показывает день, месяц и время', () => {
    expect(formatDateTime(new Date(2026, 8, 9, 17, 5).toISOString())).toBe('9 сентября в 17:05');
  });
});
