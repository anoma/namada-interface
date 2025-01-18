import { SigningStargateClient } from "@cosmjs/stargate";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { simulateIbcTransferFee } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { getIbcGasConfig } from "integrations/utils";
import invariant from "invariant";
import { createIbcTransferMessage } from "lib/transactions";
import { AddressWithAsset, ChainRegistryEntry, GasConfig } from "types";
import { sanitizeAddress } from "utils/address";
import { sanitizeChannel } from "utils/ibc";

type useSimulateIbcTransferFeeProps = {
  stargateClient?: SigningStargateClient;
  registry?: ChainRegistryEntry;
  isShieldedTransfer?: boolean;
  sourceAddress?: string;
  selectedAsset?: AddressWithAsset;
  channel?: string;
};

export const useSimulateIbcTransferFee = ({
  stargateClient,
  registry,
  selectedAsset,
  isShieldedTransfer,
  sourceAddress,
  channel,
}: useSimulateIbcTransferFeeProps): UseQueryResult<GasConfig> => {
  return useQuery({
    queryKey: [
      "gasConfig",
      registry?.chain?.chain_id,
      selectedAsset?.asset.base,
      isShieldedTransfer,
    ],
    retry: false,
    queryFn: async () => {
      const MASP_MEMO_LENGTH = 2356;
      const transferMsg = createIbcTransferMessage(
        sanitizeChannel(channel!),
        // We can't mock sourceAddress because the simulate function requires
        // a valid address with funds
        sanitizeAddress(sourceAddress!),
        sanitizeChannel(sourceAddress!),
        new BigNumber(1),
        selectedAsset?.asset.base || registry?.assets.assets[0].base || "",
        isShieldedTransfer ? "0".repeat(MASP_MEMO_LENGTH) : ""
      );

      const estimatedGas = await simulateIbcTransferFee(
        stargateClient!,
        sourceAddress!,
        transferMsg
      );

      const gasConfig = getIbcGasConfig(registry!, estimatedGas);
      invariant(gasConfig, "Error: invalid Gas config");
      return gasConfig;
    },
    enabled: Boolean(registry && stargateClient && sourceAddress && channel),
  });
};
