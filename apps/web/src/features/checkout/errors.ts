import { AppError } from '@/api/http/errors';
import type { Quote } from '@/api/types';
import { formatMoney } from '@/lib/format';

export const validationError = (message: string): AppError => {
  return new AppError({ kind: 'http', status: 400, code: 'VALIDATION_ERROR', message });
};

export const cartEmptyError = (): AppError => {
  return new AppError({ kind: 'http', status: 422, code: 'CART_EMPTY', message: 'Корзина пуста' });
};

export const quoteUpdatedError = (quote: Quote): AppError => {
  return new AppError({
    kind: 'http',
    status: 409,
    code: 'QUOTE_UPDATED',
    message: `Сумма изменилась: ${formatMoney(quote.total, quote.currency)}`,
  });
};
