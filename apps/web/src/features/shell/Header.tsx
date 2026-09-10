'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { cartQuery } from '@/api/queries';
import { cn } from '@/lib/cn';
import { formatItems } from '@/lib/format';
import { CART_HREF, NAV_ITEMS } from './constants';
import styles from './Header.module.css';

export const Header = () => {
  const pathname = usePathname();

  const cart = useQuery({ ...cartQuery(), meta: { silent: true } });
  const count = cart.data?.quantity ?? 0;

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true" />
          Магазин
        </Link>
        <nav className={styles.nav} aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(styles.link, pathname === item.href && styles.active)}
              aria-current={pathname === item.href ? 'page' : undefined}

              aria-label={
                item.href === CART_HREF && count > 0 ? `Корзина, ${formatItems(count)}` : undefined
              }
            >
              {item.label}
              {item.href === CART_HREF && count > 0 ? (
                <span className={styles.count} data-testid="cart-count" aria-hidden="true">
                  {count}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};
