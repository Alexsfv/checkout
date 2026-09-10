import type { Order } from '@/api/types';
import type { OrderStatusLabel } from './types';

export const ORDER_STATUS_LABEL: Record<Order['status'], OrderStatusLabel> = {
  awaiting_payment: { text: 'Ожидает оплаты', tone: 'warning' },
  paid: { text: 'Оплачен', tone: 'success' },
  confirmed: { text: 'Подтверждён', tone: 'accent' },
};

export const PAYMENT_SCOPE_PREFIX = 'payment';

export const DEFAULT_FAILURE_CODE = 'CARD_DECLINED';
