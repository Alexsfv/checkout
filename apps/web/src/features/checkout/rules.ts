import { EMAIL_PATTERN, PHONE_PATTERN } from '@/lib/constants';
import type { Rule } from '@/lib/types';
import { all, matches, maxLength, minLength, required } from '@/lib/validation';
import { CONTACT_FIELDS, COURIER_FIELDS, PICKUP_FIELDS } from './constants';
import type { CheckoutField, CheckoutValues } from './types';

type CheckoutRule = Rule<CheckoutValues>;

export const checkoutRules: Partial<Record<CheckoutField, CheckoutRule>> = {
  name: all(required('Укажите имя'), minLength(2), maxLength(100)),
  email: all(
    required('Укажите email'),
    matches(EMAIL_PATTERN, 'Формат: name@example.com'),
    maxLength(150),
  ),
  phone: all(required('Укажите телефон'), matches(PHONE_PATTERN, 'Формат: +79990000000')),
  pickupPointId: required('Выберите пункт выдачи'),
  city: all(required('Укажите город'), minLength(2), maxLength(100)),
  street: all(required('Укажите улицу'), minLength(2), maxLength(150)),
  house: all(required('Укажите дом'), maxLength(20)),
  apartment: maxLength(20),
};

export const activeCheckoutFields = (values: CheckoutValues): readonly CheckoutField[] => {
  return values.deliveryMethod === 'courier'
    ? [...CONTACT_FIELDS, ...COURIER_FIELDS]
    : [...CONTACT_FIELDS, ...PICKUP_FIELDS];
};
