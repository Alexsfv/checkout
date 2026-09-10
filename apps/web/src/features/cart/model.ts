import type { Cart, CartItem, Product } from '@/api/types';
import type { CartTotals } from './types';

const collect = (
  items: readonly CartItem[],
  transform: (item: CartItem) => CartItem | null,
): CartTotals => {
  return items.reduce<CartTotals>(
    (acc, item) => {
      const next = transform(item);
      if (next) {
        acc.items.push(next);
        acc.quantity += next.quantity;
        acc.subtotal += next.lineTotal;
      }
      return acc;
    },
    { items: [], quantity: 0, subtotal: 0 },
  );
};

const assemble = (cart: Cart, acc: CartTotals): Cart => {
  return { ...cart, items: acc.items, quantity: acc.quantity, subtotal: acc.subtotal };
};

export const applyCartItem = (
  cart: Cart,
  productId: string,
  quantity: number,
  product?: Product,
): Cart => {
  let replaced = false;
  const acc = collect(cart.items, (item) => {
    if (item.productId !== productId) return item;
    replaced = true;
    return { ...item, quantity, lineTotal: item.unitPrice * quantity };
  });

  if (!replaced && product) {
    const line: CartItem = {
      productId,
      title: product.title,
      unitPrice: product.price,
      quantity,
      lineTotal: product.price * quantity,
    };
    acc.items.push(line);
    acc.quantity += line.quantity;
    acc.subtotal += line.lineTotal;
  }

  return assemble(cart, acc);
};

export const withoutCartItem = (cart: Cart, productId: string): Cart => {
  return assemble(
    cart,
    collect(cart.items, (item) => (item.productId === productId ? null : item)),
  );
};
