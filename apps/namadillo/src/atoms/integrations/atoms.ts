import { ExtensionKey } from "@namada/types";
import { atomWithStorage } from "jotai/utils";

// Currently we're just integrating with Keplr, but in the future we might use different wallets
export const selectedIBCWallet = atomWithStorage<ExtensionKey | undefined>(
  "namadillo:ibc:wallet",
  undefined
);

export const selectedIBCChainAtom = atomWithStorage<string | undefined>(
  "namadillo:ibc:chainId",
  undefined
);

export const workingRpcAtoms = atomWithStorage<Record<string, string>>(
  "namadillo:rpcs",
  {}
);
