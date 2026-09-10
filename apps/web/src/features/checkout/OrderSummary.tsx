'use client';

import { describeError } from '@/api/http/messages';
import { formatItems, formatMoney, formatShipping } from '@/lib/format';
import { Card } from '@/ui/Card';
import { Skeleton } from '@/ui/Skeleton';
import { Totals } from '@/ui/Totals';
import type { OrderSummaryProps } from './types';
import styles from './OrderSummary.module.css';

export const OrderSummary = ({ cart, quote, awaitingDelivery, footer }: OrderSummaryProps) => {
  const value = quote.data;
  const stale = quote.isFetching;

  const renderShipping = () => {
    if (awaitingDelivery) return 'выберите доставку';
    if (!value && quote.isPending) return <Skeleton height={16} width={70} />;
    if (!value) return '—';
    return (
      <span className={stale ? styles.stale : undefined}>
        {formatShipping(value.shipping, value.currency)}
      </span>
    );
  };

  return (
    <Card className={styles.summary} title="Ваш заказ">
      <ul className={styles.items}>
        {cart.items.map((item) => (
          <li key={item.productId} className={styles.item}>
            <span className={styles.itemTitle}>
              {item.title}
              <span className={styles.itemQuantity}>× {item.quantity}</span>
            </span>
            <span className={styles.itemTotal}>{formatMoney(item.lineTotal, cart.currency)}</span>
          </li>
        ))}
      </ul>

      <Totals
        className={styles.totals}
        rows={[
          {
            label: formatItems(cart.quantity),
            value: formatMoney(value?.subtotal ?? cart.subtotal, cart.currency),
          },
          { label: 'Доставка', value: renderShipping(), muted: awaitingDelivery },
          {
            label: 'Итого',
            value: value ? formatMoney(value.total, value.currency) : '—',
            emphasis: true,
            live: true,
          },
        ]}
      />

      {quote.isError ? <p className={styles.error}>{describeError(quote.error).title}</p> : null}

      <div className={styles.footer}>{footer}</div>
    </Card>
  );
};
