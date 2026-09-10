'use client';

import { useEffect, useMemo, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/endpoints';
import { unwrap } from '@/api/utils';
import { idempotency } from '@/api/client';
import { hasCode } from '@/api/http/errors';
import { fieldErrors } from '@/api/http/messages';
import { cartQuery, checkoutOptionsQuery, keys, quoteQuery } from '@/api/queries';
import type { CreateOrder, Delivery, Order, Quote } from '@/api/types';
import { formatMoney } from '@/lib/format';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { useForm } from '@/lib/useForm';
import { Button } from '@/ui/Button';
import { LinkButton } from '@/ui/LinkButton';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { QueryBoundary } from '@/ui/QueryBoundary';
import { RadioCards } from '@/ui/RadioCards';
import { TextInput } from '@/ui/TextInput';
import { showToast } from '@/ui/toast';
import {
  CHECKOUT_DRAFT_KEY,
  INITIAL_CHECKOUT_VALUES,
  ORDER_SCOPE,
  QUOTE_DEBOUNCE_MS,
  QUOTE_SAFETY_MS,
} from './constants';
import { cartEmptyError, quoteUpdatedError, validationError } from './errors';
import { buildCustomer, buildDelivery } from './form';
import { activeCheckoutFields, checkoutRules } from './rules';
import type { CheckoutValues, EnsureQuoteOptions } from './types';
import { OrderSummary } from './OrderSummary';
import styles from './CheckoutPage.module.css';

export const CheckoutPage = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const cart = useQuery(cartQuery());
  const options = useQuery(checkoutOptionsQuery());

  const form = useForm<CheckoutValues>({
    initial: INITIAL_CHECKOUT_VALUES,
    rules: checkoutRules,
    activeFields: activeCheckoutFields,
    storageKey: CHECKOUT_DRAFT_KEY,
  });

  const delivery = useMemo(() => buildDelivery(form.values), [form.values]);
  const debouncedDelivery = useDebouncedValue(delivery, QUOTE_DEBOUNCE_MS);

  const hasItems = (cart.data?.items.length ?? 0) > 0;
  const cartVersion = cart.data?.version ?? 0;

  const quote = useQuery(quoteQuery(cartVersion, debouncedDelivery, hasItems && !cart.isFetching));

  useEffect(() => {
    if (hasCode(quote.error, 'CART_VERSION_CONFLICT')) {
      void queryClient.invalidateQueries({ queryKey: keys.cart });
    }
  }, [quote.error, queryClient]);

  const ensureQuote = async (value: Delivery, options?: EnsureQuoteOptions): Promise<Quote> => {
    const current = await queryClient.fetchQuery({ ...cartQuery(), staleTime: 0 });
    if (current.items.length === 0) throw cartEmptyError();

    const cached = options?.fresh
      ? undefined
      : queryClient.getQueryData<Quote>(keys.quote(current.version, value));
    if (cached && Date.parse(cached.expiresAt) - Date.now() > QUOTE_SAFETY_MS) return cached;

    const created = await api
      .createQuote({ cartVersion: current.version, delivery: value })
      .then(unwrap);

    queryClient.setQueryData(keys.quote(current.version, value), created);
    return created;
  };

  const submit = useMutation({
    mutationFn: async (): Promise<Order> => {
      const value = buildDelivery(form.values);
      if (!value) throw validationError('Заполните данные доставки');

      const shown = quote.data;
      const actual = await ensureQuote(value);

      if (shown && shown.total !== actual.total) throw quoteUpdatedError(actual);

      try {
        return await placeOrder(actual.id);
      } catch (error) {
        if (!hasCode(error, 'QUOTE_EXPIRED', 'QUOTE_NOT_FOUND', 'CART_VERSION_CONFLICT'))
          throw error;

        const recalculated = await ensureQuote(value, { fresh: true });
        if (recalculated.total !== actual.total) throw quoteUpdatedError(recalculated);
        showToast({
          title: 'Данные обновились',
          description: 'Расчёт доставки пересчитан, сумма прежняя.',
        });
        return placeOrder(recalculated.id);
      }
    },
    onSuccess: (order) => {
      idempotency.release(ORDER_SCOPE);
      queryClient.setQueryData(keys.order(order.id), order);
      void queryClient.invalidateQueries({ queryKey: keys.cart });
      void queryClient.invalidateQueries({ queryKey: keys.orders });
      queryClient.removeQueries({ queryKey: ['quote'] });
      router.push(`/orders/${order.id}`);
    },
    onError: (error) => {
      form.applyServerErrors(fieldErrors(error));
    },
  });

  const placeOrder = async (quoteId: string): Promise<Order> => {
    const body: CreateOrder = {
      quoteId,
      customer: buildCustomer(form.values),
      paymentMethod: form.values.paymentMethod,
    };
    return api.createOrder(body, idempotency.keyFor(ORDER_SCOPE, body)).then(unwrap);
  };

  const deliveryMethods = options.data?.deliveryMethods ?? [];
  const pickupPoints = useMemo(
    () => deliveryMethods.find((method) => method.id === 'pickup')?.pickupPoints ?? [],
    [deliveryMethods],
  );
  const paymentMethods = options.data?.paymentMethods ?? [];

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submit.isPending) return;
    if (!form.validate()) return;
    submit.mutate();
  };

  return (
    <div className={styles.page}>
      <h1>Оформление заказа</h1>

      <QueryBoundary query={cart}>
        {(data) =>
          data.items.length === 0 ? (
            <Card>
              <EmptyState
                title="Оформлять нечего"
                description="Корзина пуста. Добавьте товары — после этого появится расчёт доставки."
                action={
                  <LinkButton href="/" variant="primary">
                    В каталог
                  </LinkButton>
                }
              />
            </Card>
          ) : (
            <form className={styles.layout} onSubmit={handleSubmit} noValidate>
              <div className={styles.column}>
                <Card title="Контакты">
                  <div className={styles.fields}>
                    <TextInput
                      label="Имя и фамилия"
                      required
                      data-field="name"
                      autoComplete="name"
                      value={form.values.name}
                      error={form.errors.name}
                      onChange={(event) => form.setValue('name', event.target.value)}
                      onBlur={() => form.touch('name')}
                    />
                    <TextInput
                      label="Email"
                      type="email"
                      required
                      data-field="email"
                      autoComplete="email"
                      placeholder="buyer@example.test"
                      value={form.values.email}
                      error={form.errors.email}
                      onChange={(event) => form.setValue('email', event.target.value)}
                      onBlur={() => form.touch('email')}
                    />
                    <TextInput
                      label="Телефон"
                      type="tel"
                      required
                      data-field="phone"
                      autoComplete="tel"
                      placeholder="+79990000000"
                      hint="Плюс и 10–15 цифр"
                      value={form.values.phone}
                      error={form.errors.phone}
                      onChange={(event) => form.setValue('phone', event.target.value)}
                      onBlur={() => form.touch('phone')}
                    />
                  </div>
                </Card>

                <Card title="Доставка">
                  <RadioCards
                    legend="Способ доставки"
                    name="deliveryMethod"
                    value={form.values.deliveryMethod}
                    onChange={(value) => form.setValue('deliveryMethod', value)}
                    options={deliveryMethods.map((method) => ({
                      value: method.id,
                      title: method.title,
                      description:
                        method.freeFrom !== null
                          ? `Бесплатно от ${formatMoney(method.freeFrom, data.currency)}`
                          : undefined,
                      aside:
                        method.price === 0 ? 'Бесплатно' : formatMoney(method.price, data.currency),
                    }))}
                  />

                  {form.values.deliveryMethod === 'pickup' ? (
                    <div className={styles.subsection}>
                      <RadioCards
                        legend="Пункт выдачи"
                        name="pickupPointId"
                        fieldName="pickupPointId"
                        value={form.values.pickupPointId || null}
                        error={form.errors.pickupPointId}
                        onChange={(value) => {
                          form.setValue('pickupPointId', value);
                          form.touch('pickupPointId');
                        }}
                        options={pickupPoints.map((point) => ({
                          value: point.id,
                          title: point.title,
                          description: point.address,
                        }))}
                      />
                    </div>
                  ) : (
                    <div className={styles.subsection}>
                      <div className={styles.address}>
                        <TextInput
                          label="Город"
                          required
                          data-field="city"
                          autoComplete="address-level2"
                          value={form.values.city}
                          error={form.errors.city}
                          onChange={(event) => form.setValue('city', event.target.value)}
                          onBlur={() => form.touch('city')}
                        />
                        <TextInput
                          label="Улица"
                          required
                          data-field="street"
                          autoComplete="address-line1"
                          value={form.values.street}
                          error={form.errors.street}
                          onChange={(event) => form.setValue('street', event.target.value)}
                          onBlur={() => form.touch('street')}
                        />
                        <TextInput
                          label="Дом"
                          required
                          data-field="house"
                          value={form.values.house}
                          error={form.errors.house}
                          onChange={(event) => form.setValue('house', event.target.value)}
                          onBlur={() => form.touch('house')}
                        />
                        <TextInput
                          label="Квартира"
                          data-field="apartment"
                          value={form.values.apartment}
                          error={form.errors.apartment}
                          onChange={(event) => form.setValue('apartment', event.target.value)}
                          onBlur={() => form.touch('apartment')}
                        />
                      </div>
                    </div>
                  )}
                </Card>

                <Card title="Оплата">
                  <RadioCards
                    legend="Способ оплаты"
                    name="paymentMethod"
                    value={form.values.paymentMethod}
                    onChange={(value) => form.setValue('paymentMethod', value)}
                    options={paymentMethods.map((method) => ({
                      value: method.id,
                      title: method.title,
                    }))}
                  />
                  <p className={styles.note}>
                    {form.values.paymentMethod === 'card'
                      ? 'После оформления откроется тестовая платёжная форма: настоящие данные карты вводить не нужно.'
                      : 'Заказ будет подтверждён сразу, оплата — при получении.'}
                  </p>
                </Card>
              </div>

              <OrderSummary
                cart={data}
                quote={quote}
                awaitingDelivery={delivery === null}
                footer={
                  <>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      block
                      loading={submit.isPending}
                    >
                      {form.values.paymentMethod === 'card'
                        ? 'Оформить и перейти к оплате'
                        : 'Оформить заказ'}
                    </Button>
                    <p className={styles.hint}>
                      {delivery === null
                        ? 'Выберите доставку — итоговую сумму рассчитает сервер.'
                        : 'Сумма и стоимость доставки рассчитаны сервером.'}
                    </p>
                  </>
                }
              />
            </form>
          )
        }
      </QueryBoundary>
    </div>
  );
};
