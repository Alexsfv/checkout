'use client';

import { cn } from '@/lib/cn';
import { dismissToast, useToastStore } from './toast';
import styles from './Toaster.module.css';

export const Toaster = () => {
  const items = useToastStore((state) => state.items);

  return (
    <div className={styles.wrap} role="region" aria-label="Уведомления">
      {items.map((toast) => (
        <output key={toast.id} className={cn(styles.toast, styles[toast.tone])}>
          <div className={styles.body}>
            <p className={styles.title}>{toast.title}</p>
            {toast.description ? <p className={styles.description}>{toast.description}</p> : null}
          </div>
          <button
            type="button"
            className={styles.close}
            onClick={() => dismissToast(toast.id)}
            aria-label="Скрыть уведомление"
          >
            ✕
          </button>
        </output>
      ))}
    </div>
  );
};
