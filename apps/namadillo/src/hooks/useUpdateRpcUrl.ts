import { isUrlValid } from "@namada/utils";
import { isRpcAlive, rpcUrlAtom } from "atoms/settings";
import { useSetAtom } from "jotai";
import { useMemo } from "react";

export const useUpdateRpcUrl = (): ((url: string) => Promise<string>) => {
  const setRpcAtom = useSetAtom(rpcUrlAtom);

  return useMemo(() => {
    return async (url) => {
      const trimmedUrl = url.trim();
      const sanitizedUrl =
        trimmedUrl.endsWith("/") ? trimmedUrl.slice(0, -1) : url;

      if (!isUrlValid(sanitizedUrl)) {
        throw new Error(
          "Invalid URL. Please provide a valid Namada RPC URL to complete your setup."
        );
      }

      if (await isRpcAlive(sanitizedUrl)) {
        setRpcAtom(sanitizedUrl);
        return sanitizedUrl;
      } else {
        throw new Error(
          "Couldn't reach the RPC URL. Please provide a valid RPC service."
        );
      }
    };
  }, []);
};
