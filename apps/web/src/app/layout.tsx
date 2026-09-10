import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import { Header } from '@/features/shell/Header';
import './globals.css';
import styles from './layout.module.css';

export const metadata: Metadata = {
  title: 'Магазин — оформление заказа',
  description: 'Тестовое задание: каталог, корзина, оформление и оплата тестовой картой.',
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="ru">
      <body>
        <Providers>
          <a className={styles.skip} href="#main">
            Перейти к содержимому
          </a>
          <Header />
          <main className={styles.main} id="main">
            {children}
          </main>
          <footer className={styles.footer}>
            Демонстрационный магазин. Товары, адреса и карты вымышленные, реальные платежи не
            проводятся.
          </footer>
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
