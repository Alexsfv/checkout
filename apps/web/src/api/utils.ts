import { ACTIVE_PAYMENT_STATUS, TERMINAL_PAYMENT_STATUS } from './constants';
import type { HttpResult } from './http/types';

export const unwrap = <T>(result: HttpResult<T>): T => result.data;

export const isTerminalPayment = (status: string | undefined): boolean => {
  return status !== undefined && TERMINAL_PAYMENT_STATUS.has(status);
};

export const isActivePayment = (status: string | undefined): boolean => {
  return status !== undefined && ACTIVE_PAYMENT_STATUS.has(status);
};
