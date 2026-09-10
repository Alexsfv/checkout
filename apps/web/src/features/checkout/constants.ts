import type { CheckoutField, CheckoutValues } from './types';

export const CHECKOUT_DRAFT_KEY = 'checkout.form.v1';

export const ORDER_SCOPE = 'order';

export const QUOTE_DEBOUNCE_MS = 350;

export const QUOTE_SAFETY_MS = 5000;

export const CONTACT_FIELDS: readonly CheckoutField[] = ['name', 'email', 'phone'];

export const PICKUP_FIELDS: readonly CheckoutField[] = ['pickupPointId'];

export const COURIER_FIELDS: readonly CheckoutField[] = ['city', 'street', 'house', 'apartment'];

export const INITIAL_CHECKOUT_VALUES: CheckoutValues = {
  name: '',
  email: '',
  phone: '',
  deliveryMethod: 'pickup',
  pickupPointId: '',
  city: '',
  street: '',
  house: '',
  apartment: '',
  paymentMethod: 'card',
};

export const MIN_CITY_LENGTH = 2;

export const MIN_STREET_LENGTH = 2;
