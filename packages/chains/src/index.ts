import { Chain, ChainKey } from "@namada/types";
import cosmos from "./chains/cosmos";
import ethereum from "./chains/ethereum";
import namada from "./chains/namada";

export const chains: Record<ChainKey, Chain> = {
  cosmos,
  namada,
  ethereum,
};

export * from "./types";
