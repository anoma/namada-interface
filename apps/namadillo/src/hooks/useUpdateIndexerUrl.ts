import { isUrlValid } from "@namada/utils";
import { indexerUrlAtom, isIndexerAlive } from "atoms/settings";
import { useSetAtom } from "jotai";
import { useMemo } from "react";

export const useUpdateIndexerUrl = (): ((url: string) => Promise<string>) => {
  const setIndexerAtom = useSetAtom(indexerUrlAtom);

  return useMemo(() => {
    return async (url) => {
      const trimmedUrl = url.trim();
      const sanitizedUrl =
        trimmedUrl.endsWith("/") ? trimmedUrl.slice(0, -1) : url;

      if (!isUrlValid(sanitizedUrl)) {
        throw new Error(
          "Invalid URL. Please provide a valid Namada indexer URL to complete your setup."
        );
      }

      if (await isIndexerAlive(sanitizedUrl)) {
        setIndexerAtom(sanitizedUrl);
        return sanitizedUrl;
      } else {
        throw new Error(
          "Couldn't reach the indexer URL. Please provide a valid indexer service."
        );
      }
    };
  }, []);
};
