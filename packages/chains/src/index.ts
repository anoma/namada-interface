import cosmos from "./chains/cosmos";
import ethereum from "./chains/ethereum";
import namada from "./chains/namada";

export const defaultChainId = namada.chainId;
export const defaultCosmosChainId = cosmos.chainId;
export const defaultEthereumChainId = ethereum.chainId;

export const chains = {
  [cosmos.chainId]: cosmos,
  [namada.chainId]: namada,
  // [ethereum.chainId]: ethereum,
};

export * from "./types";
