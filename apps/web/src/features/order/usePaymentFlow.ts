'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { idempotency } from '@/api/client';
import { api } from '@/api/endpoints';
import { keys, paymentQuery, paymentsQuery } from '@/api/queries';
import type { Order, Scenario } from '@/api/types';
import { isActivePayment, isTerminalPayment, unwrap } from '@/api/utils';
import { PAYMENT_SCOPE_PREFIX } from './constants';
import type { PaymentFlow, PaymentPhase } from './types';

export const usePaymentFlow = (order: Order): PaymentFlow => {
  const queryClient = useQueryClient();
  const needsPayment = order.paymentMethod === 'card';

  const payments = useQuery({ ...paymentsQuery(order.id), enabled: needsPayment });

  const latest = payments.data?.[0] ?? null;

  const [trackedId, setTrackedId] = useState<string | null>(null);
  const currentId = trackedId ?? latest?.id ?? null;

  const tracked = useQuery({ ...paymentQuery(currentId ?? ''), enabled: currentId !== null });
  const attempt = currentId ? (tracked.data ?? latest) : null;

  const status = attempt?.status;
  useEffect(() => {
    if (!isTerminalPayment(status)) return;
    void queryClient.invalidateQueries({ queryKey: keys.order(order.id) });
    void queryClient.invalidateQueries({ queryKey: keys.payments(order.id) });
  }, [status, order.id, queryClient]);

  const start = useMutation({
    mutationFn: () => {
      const key = idempotency.keyFor(`${PAYMENT_SCOPE_PREFIX}:${order.id}`, order.id);
      return api.createPayment(order.id, key).then(unwrap);
    },
    onSuccess: (payment) => {
      queryClient.setQueryData(keys.payment(payment.id), payment);
      setTrackedId(payment.id);
      void queryClient.invalidateQueries({ queryKey: keys.payments(order.id) });
    },
  });

  const simulate = useMutation({
    mutationFn: (input: { paymentId: string; scenario: Scenario }) =>
      api.simulatePayment(input.paymentId, input.scenario).then(unwrap),
    onSuccess: (_result, input) => {
      void queryClient.invalidateQueries({ queryKey: keys.payment(input.paymentId) });
    },
  });

  const phase = useMemo<PaymentPhase>(() => {
    if (!attempt) return 'none';
    if (attempt.status === 'pending') return 'ready';
    if (attempt.status === 'processing') return 'processing';
    return attempt.status;
  }, [attempt]);

  return {
    attempt,
    phase,
    attempts: payments.data ?? [],
    isStarting: start.isPending,
    isSubmitting: simulate.isPending,
    start: () => {
      if (start.isPending) return;

      if (attempt && isActivePayment(attempt.status)) return;

      if (attempt && isTerminalPayment(attempt.status)) {
        idempotency.rotate(`${PAYMENT_SCOPE_PREFIX}:${order.id}`);
        setTrackedId(null);
      }
      start.mutate();
    },
    pay: (scenario) => {
      if (!attempt || simulate.isPending) return;
      simulate.mutate({ paymentId: attempt.id, scenario });
    },
    cancel: () => {
      if (!attempt || simulate.isPending) return;
      simulate.mutate({ paymentId: attempt.id, scenario: 'cancel' });
    },
  };
};
