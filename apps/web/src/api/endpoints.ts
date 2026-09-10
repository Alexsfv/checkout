import { http } from './client';
import type {
  Cart,
  CartItem,
  CheckoutOptions,
  CreateOrder,
  Order,
  Payment,
  Product,
  QuoteInput,
  Quote,
  RequestOptions,
  Sandbox,
  Scenario,
  SessionData,
  Simulation,
} from './types';

const id = (value: string) => encodeURIComponent(value);

export const api = {
  createSession: () => http.post<SessionData>('/api/sessions', {}, { auth: false }),

  listProducts: (o?: RequestOptions) => http.get<Product[]>('/api/products', { ...o, auth: false }),
  getSandbox: (o?: RequestOptions) => http.get<Sandbox>('/api/sandbox', { ...o, auth: false }),

  getCart: (o?: RequestOptions) => http.get<Cart>('/api/cart', o),
  setCartItem: (productId: string, quantity: number, o?: RequestOptions) =>
    http.put<CartItem>(`/api/cart/items/${id(productId)}`, { quantity }, o),
  removeCartItem: (productId: string, o?: RequestOptions) =>
    http.del<undefined>(`/api/cart/items/${id(productId)}`, o),

  getCheckoutOptions: (o?: RequestOptions) => http.get<CheckoutOptions>('/api/checkout/options', o),
  createQuote: (body: QuoteInput, o?: RequestOptions) => http.post<Quote>('/api/quotes', body, o),

  createOrder: (body: CreateOrder, idempotencyKey: string, o?: RequestOptions) =>
    http.post<Order>('/api/orders', body, { ...o, idempotencyKey }),
  listOrders: (o?: RequestOptions) => http.get<Order[]>('/api/orders', o),
  getOrder: (orderId: string, o?: RequestOptions) =>
    http.get<Order>(`/api/orders/${id(orderId)}`, o),

  listPayments: (orderId: string, o?: RequestOptions) =>
    http.get<Payment[]>(`/api/orders/${id(orderId)}/payments`, o),
  createPayment: (orderId: string, idempotencyKey: string, o?: RequestOptions) =>
    http.post<Payment>(`/api/orders/${id(orderId)}/payments`, {}, { ...o, idempotencyKey }),
  getPayment: (paymentId: string, o?: RequestOptions) =>
    http.get<Payment>(`/api/payments/${id(paymentId)}`, o),

  simulatePayment: (paymentId: string, scenario: Scenario, o?: RequestOptions) =>
    http.post<Simulation>(
      `/api/payments/${id(paymentId)}/simulations`,
      { scenario },
      { ...o, idempotent: true },
    ),
};
