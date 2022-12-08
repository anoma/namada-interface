import cosmos from "./chains/cosmos";
import namada from "./chains/namada";
import osmosis from "./chains/osmosis";

export const defaultChainId = namada.chainId;

export const chains = {
  [cosmos.chainId]: cosmos,
  [namada.chainId]: namada,
  [osmosis.chainId]: osmosis,
};
