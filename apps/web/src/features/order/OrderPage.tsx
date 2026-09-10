'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkoutOptionsQuery, orderQuery } from '@/api/queries';
import type { Order } from '@/api/types';
import { formatDateTime, formatItems, formatMoney, formatShipping } from '@/lib/format';
import { Alert } from '@/ui/Alert';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { LinkButton } from '@/ui/LinkButton';
import { Card } from '@/ui/Card';
import { QueryBoundary } from '@/ui/QueryBoundary';
import { Spinner } from '@/ui/Spinner';
import { Totals } from '@/ui/Totals';
import { DEFAULT_FAILURE_CODE, ORDER_STATUS_LABEL } from './constants';
import { describeDelivery } from './delivery';
import { PaymentDialog } from './PaymentDialog';
import type { PaymentSectionProps } from './types';
import { usePaymentFlow } from './usePaymentFlow';
import styles from './OrderPage.module.css';

export const OrderPage = ({ orderId }: { orderId: string }) => {
  const order = useQuery(orderQuery(orderId));

  return (
    <div className={styles.page}>
      <QueryBoundary query={order}>{(data) => <OrderView order={data} />}</QueryBoundary>
    </div>
  );
};

const OrderView = ({ order }: { order: Order }) => {
  const flow = usePaymentFlow(order);
  const options = useQuery({ ...checkoutOptionsQuery(), meta: { silent: true } });
  const [dialogOpen, setDialogOpen] = useState(false);

  const pickupPoints =
    options.data?.deliveryMethods.find((method) => method.id === 'pickup')?.pickupPoints ?? [];
  const delivery = describeDelivery(order.delivery, pickupPoints);
  const status = ORDER_STATUS_LABEL[order.status];

  useEffect(() => {
    if (order.status === 'paid') setDialogOpen(false);
  }, [order.status]);

  return (
    <>
      <header className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Заказ от {formatDateTime(order.createdAt)}</p>
          <h1>{order.number}</h1>
        </div>
        <Badge tone={status.tone}>{status.text}</Badge>
      </header>

      <PaymentSection order={order} flow={flow} onOpenDialog={() => setDialogOpen(true)} />

      <div className={styles.layout}>
        <Card title="Состав заказа" bodyClassName={styles.itemsBody}>
          <ul className={styles.items}>
            {order.items.map((item) => (
              <li key={item.productId} className={styles.item}>
                <div className={styles.itemInfo}>
                  <p className={styles.itemTitle}>{item.title}</p>
                  <p className={styles.itemMeta}>
                    {item.quantity} × {formatMoney(item.unitPrice, order.currency)}
                  </p>
                </div>
                <p className={styles.itemTotal}>{formatMoney(item.lineTotal, order.currency)}</p>
              </li>
            ))}
          </ul>
          <Totals
            className={styles.totals}
            rows={[
              {
                label: formatItems(order.items.length),
                value: formatMoney(order.subtotal, order.currency),
              },
              { label: 'Доставка', value: formatShipping(order.shipping, order.currency) },
              { label: 'Итого', value: formatMoney(order.total, order.currency), emphasis: true },
            ]}
          />
        </Card>

        <Card title="Доставка и получатель">
          <dl className={styles.details}>
            <div>
              <dt>Способ</dt>
              <dd>{delivery.title}</dd>
            </div>
            <div>
              <dt>{order.delivery.method === 'pickup' ? 'Пункт выдачи' : 'Адрес'}</dt>
              <dd>{delivery.details}</dd>
            </div>
            <div>
              <dt>Получатель</dt>
              <dd>{order.customer.name}</dd>
            </div>
            <div>
              <dt>Контакты</dt>
              <dd>
                {order.customer.email}
                <br />
                {order.customer.phone}
              </dd>
            </div>
            <div>
              <dt>Оплата</dt>
              <dd>
                {order.paymentMethod === 'card' ? 'Картой онлайн' : 'Наличными при получении'}
              </dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className={styles.footer}>
        <LinkButton href="/">Вернуться в каталог</LinkButton>
      </div>

      {order.paymentMethod === 'card' ? (
        <PaymentDialog
          open={dialogOpen}
          amount={order.total}
          currency={order.currency}
          flow={flow}
          onClose={() => setDialogOpen(false)}
        />
      ) : null}
    </>
  );
};

const PaymentSection = ({ order, flow, onOpenDialog }: PaymentSectionProps) => {
  if (order.paymentMethod === 'cash_on_delivery') {
    return (
      <Alert tone="success" title="Заказ оформлен, оплата при получении" live="polite">
        Онлайн-оплата для этого заказа не нужна. Подготовьте{' '}
        {formatMoney(order.total, order.currency)} к выдаче.
      </Alert>
    );
  }

  if (order.status === 'paid' && order.paymentStatus === 'succeeded') {
    return (
      <Alert tone="success" title="Заказ оплачен" live="polite">
        Оплата подтверждена сервером. Номер заказа — {order.number}.
      </Alert>
    );
  }

  const startPayment = () => {
    flow.start();
    onOpenDialog();
  };

  if (flow.phase === 'processing') {
    return (
      <Alert
        tone="info"
        title="Ожидаем подтверждение оплаты"
        live="polite"
        action={
          <Button size="sm" onClick={onOpenDialog}>
            Открыть форму
          </Button>
        }
      >
        <span className={styles.processing}>
          <Spinner /> Статус обновляется автоматически. Можно уйти со страницы — опрос остановится.
        </span>
      </Alert>
    );
  }

  if (flow.phase === 'failed') {
    return (
      <Alert
        tone="danger"
        title="Оплата не прошла"
        live="assertive"
        action={
          <Button size="sm" variant="primary" loading={flow.isStarting} onClick={startPayment}>
            Оплатить ещё раз
          </Button>
        }
      >
        Банк отклонил карту ({flow.attempt?.failureCode ?? DEFAULT_FAILURE_CODE}). Заказ сохранён —
        попробуйте другую карту.
      </Alert>
    );
  }

  if (flow.phase === 'cancelled') {
    return (
      <Alert
        tone="warning"
        title="Оплата отменена"
        live="polite"
        action={
          <Button size="sm" variant="primary" loading={flow.isStarting} onClick={startPayment}>
            Оплатить ещё раз
          </Button>
        }
      >
        Заказ сохранён и ждёт оплаты. Начните новую попытку в любой момент.
      </Alert>
    );
  }

  return (
    <Alert
      tone="warning"
      title="Заказ ждёт оплаты"
      action={
        <Button size="sm" variant="primary" loading={flow.isStarting} onClick={startPayment}>
          {flow.phase === 'ready' ? 'Продолжить оплату' : 'Оплатить картой'}
        </Button>
      }
    >
      К оплате {formatMoney(order.total, order.currency)}. Откроется тестовая платёжная форма.
    </Alert>
  );
};
