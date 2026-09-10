import { describe, expect, it } from 'vitest';
import type { Cart, Product } from '@/api/types';
import { applyCartItem, withoutCartItem } from './model';

const product: Product = {
  id: 'lamp-orbit',
  sku: 'DEMO-001',
  title: 'Лампа',
  description: '',
  price: 249000,
  currency: 'RUB',
  stock: 10,
};

const cart = (): Cart => ({
  id: 'cart-1',
  version: 3,
  currency: 'RUB',
  items: [
    { productId: 'lamp-orbit', title: 'Лампа', unitPrice: 249000, quantity: 1, lineTotal: 249000 },
    { productId: 'mug-line', title: 'Кружка', unitPrice: 89000, quantity: 2, lineTotal: 178000 },
  ],
  quantity: 3,
  subtotal: 427000,
});

describe('applyCartItem', () => {
  it('меняет количество и пересчитывает итоги', () => {
    const next = applyCartItem(cart(), 'lamp-orbit', 3);
    expect(next.items[0]).toMatchObject({ quantity: 3, lineTotal: 747000 });
    expect(next.quantity).toBe(5);
    expect(next.subtotal).toBe(747000 + 178000);
  });

  it('добавляет новую позицию из каталога', () => {
    const empty: Cart = { ...cart(), items: [], quantity: 0, subtotal: 0 };
    const next = applyCartItem(empty, product.id, 2, product);
    expect(next.items).toHaveLength(1);
    expect(next.items[0]).toMatchObject({
      productId: 'lamp-orbit',
      quantity: 2,
      lineTotal: 498000,
    });
    expect(next.subtotal).toBe(498000);
  });

  it('без данных о товаре не выдумывает позицию', () => {
    const empty: Cart = { ...cart(), items: [], quantity: 0, subtotal: 0 };
    expect(applyCartItem(empty, 'unknown', 1).items).toHaveLength(0);
  });

  it('не меняет исходную корзину', () => {
    const original = cart();
    applyCartItem(original, 'lamp-orbit', 9);
    expect(original.items[0]?.quantity).toBe(1);
  });

  it('версию корзины не выдумывает — её присваивает сервер', () => {
    expect(applyCartItem(cart(), 'lamp-orbit', 4).version).toBe(3);
  });
});

describe('withoutCartItem', () => {
  it('удаляет позицию и пересчитывает итоги', () => {
    const next = withoutCartItem(cart(), 'lamp-orbit');
    expect(next.items).toHaveLength(1);
    expect(next.quantity).toBe(2);
    expect(next.subtotal).toBe(178000);
  });

  it('удаление отсутствующей позиции ничего не ломает', () => {
    const next = withoutCartItem(cart(), 'unknown');
    expect(next.items).toHaveLength(2);
    expect(next.subtotal).toBe(427000);
  });
});
