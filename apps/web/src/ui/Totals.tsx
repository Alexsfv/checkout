import { cn } from '@/lib/cn';
import styles from './Totals.module.css';
import type { TotalsProps } from './types';

export const Totals = ({ rows, className }: TotalsProps) => {
  return (
    <dl className={cn(styles.totals, className)}>
      {rows.map((row, index) => (
        <div key={index} className={cn(styles.row, row.emphasis && styles.emphasis)}>
          <dt>{row.label}</dt>
          <dd className={cn(row.muted && styles.muted)} aria-live={row.live ? 'polite' : undefined}>
            {row.value}
          </dd>
        </div>
      ))}
    </dl>
  );
};
