import styles from './EmptyState.module.css';
import type { EmptyStateProps } from './types';

export const EmptyState = ({ title, description, action }: EmptyStateProps) => {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      {description ? <p className={styles.description}>{description}</p> : null}
      {action ? <div className={styles.action}>{action}</div> : null}
    </div>
  );
};
