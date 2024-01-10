import { Chain, ChainKey } from "@namada/types";
import cosmos from "./chains/cosmos";
import ethereum from "./chains/ethereum";
import namada from "./chains/namada";

export const defaultChainId = namada.chainId;
export const defaultCosmosChainId = cosmos.chainId;
export const defaultEthereumChainId = ethereum.chainId;

export const chains: Record<ChainKey, Chain> = {
  cosmos,
  namada,
  ethereum,
};

export * from "./types";
