import type { Cart, CartItem } from '@/api/types';

export interface CartTotals {
  items: CartItem[];
  quantity: number;
  subtotal: number;
}

export interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface CartMutationContext {
  previous?: Cart;
}
