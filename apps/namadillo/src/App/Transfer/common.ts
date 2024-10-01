import { Chain } from "@chain-registry/types";
import namadaShieldedSvg from "./assets/namada-shielded.svg";
import namadaTransparentSvg from "./assets/namada-transparent.svg";

export const parseChainInfo = (
  chain?: Chain,
  isShielded?: boolean
): Chain | undefined => {
  if (!chain) return undefined;

  if (chain.chain_name !== "namada") {
    return chain;
  }

  return {
    ...chain,
    pretty_name: isShielded ? "Namada Shielded" : "Namada Transparent",
    logo_URIs: {
      ...chain.logo_URIs,
      svg: isShielded ? namadaShieldedSvg : namadaTransparentSvg,
    },
  };
};
