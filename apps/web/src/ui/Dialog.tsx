'use client';

import { useEffect, useRef } from 'react';
import styles from './Dialog.module.css';
import { Button } from './Button';
import type { DialogProps } from './types';

export const Dialog = ({
  open,
  title,
  description,
  children,
  footer,
  onClose,
  dismissible = true,
}: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    if (!open && element.open) element.close();
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) closeRef.current();
      }}
      onClick={(event) => {
        if (dismissible && event.target === ref.current) closeRef.current();
      }}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title} id="dialog-title">
              {title}
            </h2>
            {description ? <p className={styles.description}>{description}</p> : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Закрыть окно">
            ✕
          </Button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </dialog>
  );
};
