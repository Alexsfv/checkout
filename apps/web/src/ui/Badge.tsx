import { cn } from '@/lib/cn';
import styles from './Badge.module.css';
import type { BadgeProps } from './types';

export const Badge = ({ tone = 'neutral', icon, children }: BadgeProps) => {
  return (
    <span className={cn(styles.badge, styles[tone])}>
      {icon}
      {children}
    </span>
  );
};
