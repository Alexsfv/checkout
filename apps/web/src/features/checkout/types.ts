import type { Cart, Quote } from '@/api/types';
import type { Values } from '@/lib/types';
import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

export interface CheckoutValues extends Values {
  name: string;
  email: string;
  phone: string;
  deliveryMethod: 'pickup' | 'courier';
  pickupPointId: string;
  city: string;
  street: string;
  house: string;
  apartment: string;
  paymentMethod: 'card' | 'cash_on_delivery';
}

export type CheckoutField = keyof CheckoutValues;

export interface OrderSummaryProps {
  cart: Cart;
  quote: UseQueryResult<Quote>;
  awaitingDelivery: boolean;
  footer: ReactNode;
}

export interface EnsureQuoteOptions {
  fresh?: boolean;
}
