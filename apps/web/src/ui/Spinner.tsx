import { cn } from '@/lib/cn';
import styles from './Spinner.module.css';
import type { SpinnerProps } from './types';

export const Spinner = ({ size = 'sm', className, label }: SpinnerProps) => {
  return (
    <span
      className={cn(styles.spinner, size === 'md' && styles.md, className)}
      role={label ? 'status' : undefined}
      aria-hidden={label ? undefined : true}
    >
      {label ? <span className="visually-hidden">{label}</span> : null}
    </span>
  );
};
