'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ordersQuery } from '@/api/queries';
import { Alert } from '@/ui/Alert';
import styles from './ResumeOrderBanner.module.css';

export const ResumeOrderBanner = () => {
  const orders = useQuery({ ...ordersQuery(), meta: { silent: true } });
  const pending = orders.data?.find(
    (order) => order.paymentMethod === 'card' && order.status !== 'paid',
  );
  if (!pending) return null;

  return (
    <Alert
      tone="warning"
      title={`Заказ ${pending.number} ещё не оплачен`}
      action={
        <Link className={styles.link} href={`/orders/${pending.id}`}>
          Продолжить оплату
        </Link>
      }
    >
      Можно вернуться к оплате в любой момент — заказ сохранён.
    </Alert>
  );
};
