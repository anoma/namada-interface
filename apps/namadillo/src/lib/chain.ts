import { Chain } from "@chain-registry/types";
import { namadaTestnetChainList } from "atoms/integrations";

export const searchNamadaTestnetByChainId = (
  chainId: string
): Chain | undefined => {
  return namadaTestnetChainList.find((chain) => chain.chain_id === chainId);
};
