import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes fresh window
      gcTime: 10 * 60 * 1000, // 10 minutes cache retention (garbage collection)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
