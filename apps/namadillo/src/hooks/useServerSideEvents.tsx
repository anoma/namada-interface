import { useSSE } from "@namada/hooks";
import { chainStatusAtom } from "atoms/chain";
import { indexerUrlAtom } from "atoms/settings";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect } from "react";
import { ChainStatus } from "types";

export const useServerSideEvents = (): void => {
  const url = useAtomValue(indexerUrlAtom);
  const chainStatusSSE = useSSE<ChainStatus>(`${url}/api/v1/chain/status`);
  const setChainStatus = useSetAtom(chainStatusAtom);

  // Chain Status (epochs and block height)
  useEffect(() => {
    if (chainStatusSSE.data) {
      setChainStatus(chainStatusSSE.data);
    }
  }, [chainStatusSSE]);
};
