'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { cartQuery, productsQuery } from '@/api/queries';
import { QueryBoundary } from '@/ui/QueryBoundary';
import { Skeleton } from '@/ui/Skeleton';
import { indexBy } from '@/lib/collections';
import { useCartActions } from '@/features/cart/useCartActions';
import { ResumeOrderBanner } from '@/features/order/ResumeOrderBanner';
import { CATALOG_SKELETON_COUNT, CATALOG_SKELETON_HEIGHT } from './constants';
import { ProductCard } from './ProductCard';
import styles from './CatalogPage.module.css';

export const CatalogPage = () => {
  const products = useQuery(productsQuery());
  const cart = useQuery(cartQuery());
  const actions = useCartActions();

  const inCart = useMemo(() => indexBy(cart.data?.items, (item) => item.productId), [cart.data]);

  return (
    <div className={styles.page}>
      <ResumeOrderBanner />
      <header className={styles.head}>
        <h1>Каталог</h1>
        <p className={styles.subtitle}>
          Учебные товары. Добавьте что-нибудь в корзину и оформите заказ.
        </p>
      </header>

      <QueryBoundary
        query={products}
        skeleton={
          <div className={styles.grid}>
            {Array.from({ length: CATALOG_SKELETON_COUNT }, (_, index) => (
              <Skeleton key={index} height={CATALOG_SKELETON_HEIGHT} width="100%" />
            ))}
          </div>
        }
      >
        {(items) => (
          <ul className={styles.grid}>
            {items.map((product) => (
              <li key={product.id}>
                <ProductCard
                  product={product}
                  item={inCart.get(product.id)}
                  busy={actions.isBusy(product.id)}
                  onSetQuantity={(quantity) =>
                    actions.setItem.mutate({ productId: product.id, quantity })
                  }
                  onRemove={() => actions.removeItem.mutate({ productId: product.id })}
                />
              </li>
            ))}
          </ul>
        )}
      </QueryBoundary>
    </div>
  );
};
