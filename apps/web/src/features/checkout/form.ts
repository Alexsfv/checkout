import type { Customer, Delivery } from '@/api/types';
import { MIN_CITY_LENGTH, MIN_STREET_LENGTH } from './constants';
import type { CheckoutValues } from './types';

export const buildDelivery = (values: CheckoutValues): Delivery | null => {
  if (values.deliveryMethod === 'pickup') {
    return values.pickupPointId ? { method: 'pickup', pickupPointId: values.pickupPointId } : null;
  }
  const city = values.city.trim();
  const street = values.street.trim();
  const house = values.house.trim();
  const apartment = values.apartment.trim();
  if (city.length < MIN_CITY_LENGTH || street.length < MIN_STREET_LENGTH || house.length < 1) {
    return null;
  }
  return {
    method: 'courier',
    address: { city, street, house, ...(apartment ? { apartment } : {}) },
  };
};

export const buildCustomer = (values: CheckoutValues): Customer => {
  return { name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim() };
};
