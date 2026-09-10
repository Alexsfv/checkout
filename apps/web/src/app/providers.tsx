'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isAbort } from '@/api/http/errors';
import { describeError } from '@/api/http/messages';
import { hydrateSession, useSessionStore } from '@/api/session';
import { Toaster } from '@/ui/Toaster';
import { showToast } from '@/ui/toast';

const isSilent = (meta: Record<string, unknown> | undefined): boolean => {
  return meta?.silent === true;
};

const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: true,
        gcTime: 5 * 60_000,
      },
      mutations: { retry: false },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isAbort(error) || isSilent(query.meta)) return;

        if (query.state.data === undefined) return;
        const view = describeError(error);
        showToast({ tone: 'danger', title: view.title, description: view.description });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (isAbort(error) || isSilent(mutation.meta)) return;
        const view = describeError(error);
        showToast({ tone: 'danger', title: view.title, description: view.description });
      },
    }),
  });
};

export const Providers = ({ children }: { children: ReactNode }) => {
  const [queryClient] = useState(createQueryClient);

  useEffect(() => {
    hydrateSession();

    return useSessionStore.subscribe((state, previous) => {
      if (previous.token && state.token !== previous.token) queryClient.clear();
    });
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
};
