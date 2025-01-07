import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

type ErrorWithResponse = Error & {
  response?: {
    status?: number;
  };
};

const MAX_RETRIES = 3;
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: ErrorWithResponse) => {
        if (failureCount > MAX_RETRIES) {
          return false;
        }

        // Handles all 4xx errors
        if (String(error?.response?.status).startsWith("4")) {
          return false;
        }

        return true;
      },
    },
  },
});

export const QueryProvider = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
