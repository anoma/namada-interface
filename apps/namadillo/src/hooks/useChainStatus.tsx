import { useSSE } from "@namada/hooks";
import { indexerUrlAtom } from "atoms/settings";
import { useAtomValue } from "jotai";

export type ChainStatus = {
  height: number;
  epoch: number;
};

export const useChainStatus = (): {
  data?: ChainStatus;
  error?: Event;
  closeFn?: () => void;
} => {
  const url = useAtomValue(indexerUrlAtom);

  return useSSE<ChainStatus>(`${url}/api/v1/chain/status`);
};
