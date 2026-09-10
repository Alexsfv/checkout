'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartQuery, productsQuery } from '@/api/queries';
import { indexBy } from '@/lib/collections';
import { formatItems, formatMoney } from '@/lib/format';
import { Button } from '@/ui/Button';
import { LinkButton } from '@/ui/LinkButton';
import { Card } from '@/ui/Card';
import { EmptyState } from '@/ui/EmptyState';
import { QueryBoundary } from '@/ui/QueryBoundary';
import { QuantityStepper } from '@/ui/QuantityStepper';
import { Totals } from '@/ui/Totals';
import { useCartActions } from './useCartActions';
import styles from './CartPage.module.css';

export const CartPage = () => {
  const cart = useQuery(cartQuery());
  const products = useQuery(productsQuery());
  const actions = useCartActions();

  const stock = useMemo(() => indexBy(products.data, (product) => product.id), [products.data]);

  return (
    <div className={styles.page}>
      <h1>Корзина</h1>

      <QueryBoundary query={cart}>
        {(data) =>
          data.items.length === 0 ? (
            <Card>
              <EmptyState
                title="Корзина пуста"
                description="Добавьте товары из каталога, чтобы перейти к оформлению."
                action={
                  <LinkButton href="/" variant="primary">
                    Перейти в каталог
                  </LinkButton>
                }
              />
            </Card>
          ) : (
            <div className={styles.layout}>
              <Card className={styles.items} bodyClassName={styles.itemsBody} title="Товары">
                <ul className={styles.list}>
                  {data.items.map((item) => {
                    const busy = actions.isBusy(item.productId);
                    const max = stock.get(item.productId)?.stock ?? item.quantity;
                    return (
                      <li key={item.productId} className={styles.item}>
                        <div className={styles.info}>
                          <p className={styles.title}>{item.title}</p>
                          <p className={styles.unit}>
                            {formatMoney(item.unitPrice, data.currency)} за штуку
                          </p>
                        </div>
                        <QuantityStepper
                          label={`Количество: ${item.title}`}
                          value={item.quantity}
                          max={max}
                          busy={busy}
                          onChange={(quantity) =>
                            actions.setItem.mutate({ productId: item.productId, quantity })
                          }
                        />
                        <p className={styles.lineTotal}>
                          {formatMoney(item.lineTotal, data.currency)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => actions.removeItem.mutate({ productId: item.productId })}
                          aria-label={`Удалить из корзины: ${item.title}`}
                        >
                          Удалить
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </Card>

              <Card className={styles.summary} title="Итог">
                <Totals
                  className={styles.totals}
                  rows={[
                    {
                      label: formatItems(data.quantity),
                      value: formatMoney(data.subtotal, data.currency),
                    },
                    { label: 'Доставка', value: 'рассчитаем при оформлении', muted: true },
                  ]}
                />
                <LinkButton href="/checkout" variant="primary" size="lg" block>
                  Перейти к оформлению
                </LinkButton>
              </Card>
            </div>
          )
        }
      </QueryBoundary>
    </div>
  );
};
