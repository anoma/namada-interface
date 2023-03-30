import cosmos from "./chains/cosmos";
import namada from "./chains/namada";
import ethereum from "./chains/ethereum";

export const defaultChainId = namada.chainId;

export const chains = {
  [cosmos.chainId]: cosmos,
  [namada.chainId]: namada,
  [ethereum.chainId]: ethereum,
};
