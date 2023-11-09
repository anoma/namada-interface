import { Ports } from "router";
import { useRequester } from "./useRequester";
import { CheckPasswordInitializedMsg } from "background/vault";
import { useEffect, useState } from "react";

export const usePasswordInitialized = (): boolean | undefined => {
  const requester = useRequester();
  const [passwordInitialized, setPasswordInitialized] = useState<
    boolean | undefined
  >();

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        const isInitialized = await requester.sendMessage(
          Ports.Background,
          new CheckPasswordInitializedMsg()
        );
        setPasswordInitialized(isInitialized);
      } catch (err) {
        throw err;
      }
    };
    load();
  }, [requester]);

  return passwordInitialized;
};
