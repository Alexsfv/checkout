'use client';

import { cn } from '@/lib/cn';
import { Spinner } from './Spinner';
import styles from './Button.module.css';
import type { ButtonProps } from './types';

export const Button = ({
  variant = 'secondary',
  size = 'md',
  loading = false,
  block = false,
  icon,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      type={type}
      className={cn(styles.button, styles[variant], styles[size], block && styles.block, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading ? <Spinner /> : icon}
      <span className={styles.label}>{children}</span>
    </button>
  );
};
