'use client';

import { memo } from 'react';
import { formatMoney } from '@/lib/format';
import { Badge } from '@/ui/Badge';
import { Button } from '@/ui/Button';
import { QuantityStepper } from '@/ui/QuantityStepper';
import { LOW_STOCK_THRESHOLD } from './constants';
import styles from './ProductCard.module.css';
import type { ProductCardProps } from './types';

export const ProductCard = memo(function ProductCard({
  product,
  item,
  busy,
  onSetQuantity,
  onRemove,
}: ProductCardProps) {
  const available = product.stock > 0;
  const limitReached = item !== undefined && item.quantity >= product.stock;

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <h3 className={styles.title}>{product.title}</h3>
        {available ? (
          <Badge tone={product.stock <= LOW_STOCK_THRESHOLD ? 'warning' : 'neutral'}>
            Остаток: {product.stock}
          </Badge>
        ) : (
          <Badge tone="danger">Нет в наличии</Badge>
        )}
      </div>
      <p className={styles.description}>{product.description}</p>
      <p className={styles.price}>{formatMoney(product.price, product.currency)}</p>

      <div className={styles.actions}>
        {item ? (
          <>
            <QuantityStepper
              label={`Количество: ${product.title}`}
              value={item.quantity}
              max={product.stock}
              busy={busy}
              onChange={onSetQuantity}
            />
            <Button variant="ghost" size="sm" onClick={onRemove} disabled={busy}>
              Удалить
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            block
            loading={busy}
            disabled={!available}
            onClick={() => onSetQuantity(1)}
            aria-label={available ? `Добавить в корзину: ${product.title}` : undefined}
          >
            {available ? 'В корзину' : 'Нет в наличии'}
          </Button>
        )}
      </div>
      {limitReached ? <p className={styles.note}>Это весь доступный остаток.</p> : null}
    </article>
  );
});
