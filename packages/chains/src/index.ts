import { Chain, ChainKey } from "@namada/types";
import cosmos from "./chains/cosmos";
import ethereum from "./chains/ethereum";
import namada from "./chains/namada";

export const chains = {
  cosmos,
  namada,
  ethereum,
} satisfies Record<ChainKey, Chain>;

export * from "./types";
