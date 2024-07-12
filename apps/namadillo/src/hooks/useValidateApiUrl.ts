import { isUrlValid } from "@namada/utils";
import { isApiAlive } from "atoms/settings";
import { useCallback } from "react";

export const useValidateApiUrl = (): ((url: string) => Promise<string>) => {
  return useCallback(async (url) => {
    const trimmedUrl = url.trim();
    const sanitizedUrl =
      trimmedUrl.endsWith("/") ? trimmedUrl.slice(0, -1) : url;

    if (!isUrlValid(sanitizedUrl)) {
      throw new Error("Invalid URL. The URL should starts with 'http'.");
    }

    if (await isApiAlive(sanitizedUrl)) {
      return sanitizedUrl;
    } else {
      throw new Error(
        "Couldn't reach the URL. Please provide a valid Namada URL service."
      );
    }
  }, []);
};
