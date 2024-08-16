import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultStore } from "jotai";
import { queryClientAtom } from "jotai-tanstack-query";
import { Provider as JotaiProvider } from "jotai/react";
import { useHydrateAtoms } from "jotai/utils";

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

const HydrateAtoms = (props: { children: JSX.Element }): JSX.Element => {
  useHydrateAtoms([[queryClientAtom, queryClient]]);
  return props.children;
};

export const QueryProvider = ({
  children,
}: {
  children: JSX.Element;
}): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider store={getDefaultStore()}>
        <HydrateAtoms>{children}</HydrateAtoms>
      </JotaiProvider>
    </QueryClientProvider>
  );
};
