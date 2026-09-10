import { cn } from '@/lib/cn';
import styles from './Card.module.css';
import type { CardProps } from './types';

export const Card = ({
  as: Tag = 'section',
  title,
  aside,
  children,
  className,
  bodyClassName,
}: CardProps) => {
  return (
    <Tag className={cn(styles.card, className)}>
      {title ? (
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          {aside}
        </header>
      ) : null}
      <div className={cn(styles.body, bodyClassName)}>{children}</div>
    </Tag>
  );
};
