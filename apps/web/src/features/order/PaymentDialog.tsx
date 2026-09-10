'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sandboxQuery } from '@/api/queries';
import { formatMoney } from '@/lib/format';
import { Alert } from '@/ui/Alert';
import { Button } from '@/ui/Button';
import { Dialog } from '@/ui/Dialog';
import { RadioCards } from '@/ui/RadioCards';
import { Skeleton } from '@/ui/Skeleton';
import { Spinner } from '@/ui/Spinner';
import { DEFAULT_FAILURE_CODE } from './constants';
import type { PaymentDialogProps } from './types';
import styles from './PaymentDialog.module.css';

export const PaymentDialog = ({ open, amount, currency, flow, onClose }: PaymentDialogProps) => {
  const sandbox = useQuery({ ...sandboxQuery(), enabled: open });
  const [cardId, setCardId] = useState<string | null>(null);
  const cards = sandbox.data?.cards ?? [];

  useEffect(() => {
    setCardId((current) => current ?? cards[0]?.id ?? null);
  }, [cards]);

  const card = cards.find((item) => item.id === cardId) ?? null;
  const busy = flow.isStarting || flow.isSubmitting || flow.phase === 'processing';

  const renderBody = () => {
    if (flow.phase === 'succeeded') {
      return (
        <Alert tone="success" title="Оплата прошла" live="polite">
          Подтверждаем статус заказа на сервере.
        </Alert>
      );
    }
    if (flow.phase === 'failed') {
      return (
        <Alert tone="danger" title="Банк отклонил оплату" live="assertive">
          Код отказа: {flow.attempt?.failureCode ?? DEFAULT_FAILURE_CODE}. Заказ сохранён — можно
          оплатить ещё раз.
        </Alert>
      );
    }
    if (flow.phase === 'cancelled') {
      return (
        <Alert tone="warning" title="Оплата отменена" live="polite">
          Заказ сохранён. Начните новую попытку, когда будете готовы.
        </Alert>
      );
    }
    if (flow.phase === 'processing') {
      return (
        <div className={styles.processing} role="status" aria-live="polite">
          <Spinner size="md" />
          <div>
            <p className={styles.processingTitle}>Проверяем оплату</p>
            <p className={styles.processingText}>
              Ждём ответ платёжного сервиса. Окно можно закрыть — статус продолжит обновляться на
              странице заказа.
            </p>
          </div>
        </div>
      );
    }

    if (sandbox.isPending || flow.isStarting) {
      return (
        <div className={styles.loading}>
          <Skeleton height={62} width="100%" />
          <Skeleton height={62} width="100%" />
        </div>
      );
    }

    return (
      <>
        <RadioCards
          legend="Тестовая карта"
          name="testCard"
          value={cardId}
          onChange={setCardId}
          options={cards.map((item) => ({
            value: item.id,
            title: item.title,
            description: item.maskedNumber,
          }))}
        />
        <p className={styles.note}>
          Это имитация: реальные реквизиты вводить не нужно. Карта определяет, чем закончится
          попытка.
        </p>
      </>
    );
  };

  const renderFooter = () => {
    if (flow.phase === 'succeeded') {
      return (
        <Button variant="primary" onClick={onClose}>
          К заказу
        </Button>
      );
    }
    if (flow.phase === 'failed' || flow.phase === 'cancelled') {
      return (
        <>
          <Button onClick={onClose}>Закрыть</Button>
          <Button variant="primary" loading={flow.isStarting} onClick={flow.start}>
            Оплатить ещё раз
          </Button>
        </>
      );
    }
    return (
      <>
        <Button
          variant="danger"
          onClick={flow.cancel}
          disabled={!flow.attempt || flow.phase === 'processing' || flow.isSubmitting}
        >
          Отменить оплату
        </Button>
        <Button
          variant="primary"
          loading={flow.isSubmitting || flow.phase === 'processing'}
          disabled={!card || !flow.attempt || busy}
          onClick={() => card && flow.pay(card.scenario)}
        >
          Оплатить {formatMoney(amount, currency)}
        </Button>
      </>
    );
  };

  return (
    <Dialog
      open={open}
      title="Оплата картой"
      description={`К оплате ${formatMoney(amount, currency)}`}
      onClose={onClose}
      footer={renderFooter()}
    >
      {renderBody()}
    </Dialog>
  );
};
