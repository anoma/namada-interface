import { Chain } from "@chain-registry/types";
import { ExtensionKey } from "@namada/types";
import { queryAndStoreRpc } from "atoms/registry";
import { atomWithMutation } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import { IBCTransferParams, submitIbcTransfer } from "./services";

type IBCTransferAtomParams = {
  transferParams: IBCTransferParams;
  chain: Chain;
};

// Currently we're just integrating with Keplr, but in the future we might use different wallets
export const selectedIBCWallet = atomWithStorage<ExtensionKey | undefined>(
  "namadillo:ibc:wallet",
  undefined
);

export const selectedIBCChainAtom = atomWithStorage<string | undefined>(
  "namadillo:ibc:chainId",
  undefined
);

export const workingRpcsAtom = atomWithStorage<Record<string, string>>(
  "namadillo:rpcs",
  {}
);

export const ibcTransferAtom = atomWithMutation(() => {
  return {
    mutationKey: ["ibc-transfer"],
    mutationFn: async ({
      transferParams,
      chain,
    }: IBCTransferAtomParams): Promise<void> => {
      await queryAndStoreRpc(chain, submitIbcTransfer(transferParams));
    },
  };
});
