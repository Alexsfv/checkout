import { cn } from '@/lib/cn';
import styles from './Skeleton.module.css';
import type { SkeletonListProps, SkeletonProps } from './types';

export const Skeleton = ({ height = 16, width, className }: SkeletonProps) => {
  return (
    <span className={cn(styles.skeleton, className)} style={{ height, width }} aria-hidden="true" />
  );
};

export const SkeletonList = ({ rows = 3, height = 72 }: SkeletonListProps) => {
  return (
    <div className={styles.list} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton key={index} height={height} width="100%" />
      ))}
    </div>
  );
};
