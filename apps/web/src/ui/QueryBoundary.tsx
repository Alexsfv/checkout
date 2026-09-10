'use client';

import { describeError } from '@/api/http/messages';
import { Alert } from './Alert';
import { Button } from './Button';
import { SkeletonList } from './Skeleton';
import type { QueryBoundaryProps } from './types';

export const QueryBoundary = <T,>({ query, skeleton, children }: QueryBoundaryProps<T>) => {
  if (query.isPending) return <>{skeleton ?? <SkeletonList />}</>;

  if (query.isError) {
    const view = describeError(query.error);
    return (
      <Alert
        tone="danger"
        title={view.title}
        action={
          view.retriable ? (
            <Button size="sm" onClick={() => void query.refetch()} loading={query.isFetching}>
              Повторить
            </Button>
          ) : null
        }
      >
        {view.description}
      </Alert>
    );
  }

  return <>{children(query.data)}</>;
};
