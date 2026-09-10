import { cn } from '@/lib/cn';
import styles from './Alert.module.css';
import type { AlertProps } from './types';

export const Alert = ({ tone = 'info', title, children, action, live, className }: AlertProps) => {
  return (
    <div
      className={cn(styles.alert, styles[tone], className)}
      role={tone === 'danger' ? 'alert' : 'status'}
      aria-live={live}
    >
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {children ? <div className={styles.text}>{children}</div> : null}
      </div>
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
};
