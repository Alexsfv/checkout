import Link from 'next/link';
import { cn } from '@/lib/cn';
import styles from './Button.module.css';
import type { LinkButtonProps } from './types';

export const LinkButton = ({
  href,
  variant = 'secondary',
  size = 'md',
  block = false,
  className,
  children,
  ...rest
}: LinkButtonProps) => (
  <Link
    {...rest}
    href={href}
    className={cn(styles.button, styles[variant], styles[size], block && styles.block, className)}
  >
    <span className={styles.label}>{children}</span>
  </Link>
);
