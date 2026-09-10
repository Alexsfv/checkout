import { queryOptions } from '@tanstack/react-query';
import { stableStringify } from '@/lib/uuid';
import {
  CATALOG_STALE_MS,
  ORDERS_STALE_MS,
  PAYMENT_POLL_MS,
  QUOTE_GC_MS,
  QUOTE_STALE_MS,
} from './constants';
import { api } from './endpoints';
import type { Delivery } from './types';
import { isTerminalPayment, unwrap } from './utils';

export const keys = {
  products: ['products'] as const,
  sandbox: ['sandbox'] as const,
  cart: ['cart'] as const,
  checkoutOptions: ['checkout-options'] as const,
  orders: ['orders'] as const,
  quotes: ['quote'] as const,
  order: (orderId: string) => ['order', orderId] as const,
  payments: (orderId: string) => ['payments', orderId] as const,
  payment: (paymentId: string) => ['payment', paymentId] as const,
  quote: (cartVersion: number, delivery: Delivery | null) =>
    ['quote', cartVersion, delivery ? stableStringify(delivery) : null] as const,
};

export const productsQuery = () =>
  queryOptions({
    queryKey: keys.products,
    queryFn: ({ signal }) => api.listProducts({ signal }).then(unwrap),
    staleTime: CATALOG_STALE_MS,
  });

export const sandboxQuery = () =>
  queryOptions({
    queryKey: keys.sandbox,
    queryFn: ({ signal }) => api.getSandbox({ signal }).then(unwrap),
    staleTime: Infinity,
  });

export const cartQuery = () =>
  queryOptions({
    queryKey: keys.cart,
    queryFn: ({ signal }) => api.getCart({ signal }).then(unwrap),
    staleTime: 0,
  });

export const checkoutOptionsQuery = () =>
  queryOptions({
    queryKey: keys.checkoutOptions,
    queryFn: ({ signal }) => api.getCheckoutOptions({ signal }).then(unwrap),
    staleTime: CATALOG_STALE_MS,
  });

export const quoteQuery = (cartVersion: number, delivery: Delivery | null, enabled: boolean) =>
  queryOptions({
    queryKey: keys.quote(cartVersion, delivery),
    queryFn: ({ signal }) =>
      api.createQuote({ cartVersion, delivery: delivery as Delivery }, { signal }).then(unwrap),
    enabled: enabled && delivery !== null,
    staleTime: QUOTE_STALE_MS,
    gcTime: QUOTE_GC_MS,
    retry: false,
  });

export const orderQuery = (orderId: string) =>
  queryOptions({
    queryKey: keys.order(orderId),
    queryFn: ({ signal }) => api.getOrder(orderId, { signal }).then(unwrap),
    staleTime: 0,
  });

export const ordersQuery = () =>
  queryOptions({
    queryKey: keys.orders,
    queryFn: ({ signal }) => api.listOrders({ signal }).then(unwrap),
    staleTime: ORDERS_STALE_MS,
  });

export const paymentsQuery = (orderId: string) =>
  queryOptions({
    queryKey: keys.payments(orderId),
    queryFn: ({ signal }) => api.listPayments(orderId, { signal }).then(unwrap),
    staleTime: 0,
  });

export const paymentQuery = (paymentId: string) =>
  queryOptions({
    queryKey: keys.payment(paymentId),
    queryFn: ({ signal }) => api.getPayment(paymentId, { signal }).then(unwrap),
    refetchInterval: (query) =>
      isTerminalPayment(query.state.data?.status) ? false : PAYMENT_POLL_MS,
    refetchIntervalInBackground: false,
    staleTime: 0,
  });
