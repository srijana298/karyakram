import { QueryClient } from "@tanstack/react-query";

// Shared query client. Our service layer returns { ok, data, error } objects
// (it never throws), so query functions throw on `!ok` to drive React Query's
// error state. Defaults are tuned for a dashboard: refetch on focus off, a
// short stale window, and one retry.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});
