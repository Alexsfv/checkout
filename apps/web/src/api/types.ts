import type { Static } from '@sinclair/typebox';
import type {
  AddressSchema,
  Delivery,
  CartItemSchema,
  CheckoutOptionsSchema,
  Order,
  Payment,
  PaymentMethodSchema,
  SandboxSchema,
  SessionSchema,
} from '@checkout/contracts';

export type {
  Cart,
  CreateOrder,
  Customer,
  Delivery,
  Order,
  Payment,
  Product,
  Quote,
  Scenario,
  Simulation,
} from '@checkout/contracts';

export type CartItem = Static<typeof CartItemSchema>;
export type Address = Static<typeof AddressSchema>;
export type CheckoutOptions = Static<typeof CheckoutOptionsSchema>;
export type Sandbox = Static<typeof SandboxSchema>;
export type SessionData = Static<typeof SessionSchema>;
export type PaymentMethod = Static<typeof PaymentMethodSchema>;
export type DeliveryMethod = CheckoutOptions['deliveryMethods'][number];
export type PickupPoint = DeliveryMethod['pickupPoints'][number];
export type TestCard = Sandbox['cards'][number];
export type DeliveryKind = DeliveryMethod['id'];
export type PaymentStatus = Payment['status'];
export type OrderStatus = Order['status'];

export interface StoredSession {
  id: string;
  token: string;
}

export interface SessionState {
  token: string | null;
  sessionId: string | null;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

export interface QuoteInput {
  cartVersion: number;
  delivery: Delivery;
}
