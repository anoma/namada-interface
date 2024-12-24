import { useMemo } from "react";
import {
  Address,
  AddressWithAssetAndAmount,
  ChainRegistryEntry,
  GasConfig,
  TransferTransactionData,
} from "types";

type useIbcTransactionProps = {
  sourceAddress?: string;
  registry?: ChainRegistryEntry;
  sourceChannel?: string;
  shielded?: boolean;
  destinationChannel?: Address;
  selectedAsset?: AddressWithAssetAndAmount;
};

import { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";
import { QueryStatus } from "@tanstack/query-core";
import { ibcTransferAtom } from "atoms/integrations";
import BigNumber from "bignumber.js";
import { getIbcGasConfig } from "integrations/utils";
import { useAtomValue } from "jotai";

type useIbcTransactionOutput = {
  transferToNamada: (
    destinationAddress: string,
    displayAmount: BigNumber
  ) => Promise<TransferTransactionData>;
  transferStatus: "idle" | QueryStatus;
  gasConfig: GasConfig | undefined;
  assertValid: () => void;
};

export const useIbcTransaction = ({
  registry,
  sourceAddress,
  selectedAsset,
  sourceChannel,
  shielded,
  destinationChannel,
}: useIbcTransactionProps): useIbcTransactionOutput => {
  const performIbcTransfer = useAtomValue(ibcTransferAtom);

  const gasConfig = useMemo(() => {
    if (typeof registry !== "undefined") {
      return getIbcGasConfig(registry);
    }
    return undefined;
  }, [registry]);

  const getWallet = (): Keplr => {
    const wallet = (window as KeplrWindow).keplr;
    if (typeof wallet === "undefined") {
      throw new Error("No Keplr instance");
    }
    return wallet;
  };

  const assertValid = (): void => {
    if (typeof sourceAddress === "undefined") {
      throw new Error("Source address is not defined");
    }

    if (!selectedAsset) {
      throw new Error("No asset is selected");
    }

    if (!registry) {
      throw new Error("Invalid chain");
    }

    if (!sourceChannel) {
      throw new Error("Invalid IBC source channel");
    }

    if (shielded && !destinationChannel) {
      throw new Error("Invalid IBC destination channel");
    }

    if (typeof gasConfig === "undefined") {
      throw new Error("No transaction fee is set");
    }
  };

  const transferToNamada = async (
    destinationAddress: Address,
    displayAmount: BigNumber
  ): Promise<TransferTransactionData> => {
    assertValid();

    // Set Keplr option to allow Namadillo to set the transaction fee
    const baseKeplr = getWallet();
    const chainId = registry!.chain.chain_id;
    const savedKeplrOptions = baseKeplr.defaultOptions;
    let tx: TransferTransactionData;

    baseKeplr.defaultOptions = {
      sign: {
        preferNoSetFee: true,
      },
    };

    try {
      tx = await performIbcTransfer.mutateAsync({
        chain: registry!.chain,
        transferParams: {
          signer: baseKeplr.getOfflineSigner(chainId),
          chainId,
          sourceAddress: sourceAddress!,
          destinationAddress,
          amount: displayAmount,
          asset: selectedAsset!,
          gasConfig: gasConfig!,
          sourceChannelId: sourceChannel!.trim(),
          ...(shielded ?
            {
              isShielded: true,
              destinationChannelId: destinationChannel!.trim(),
            }
          : {
              isShielded: false,
            }),
        },
      });
    } catch (err) {
      throw err;
    } finally {
      baseKeplr.defaultOptions = savedKeplrOptions;
    }

    return tx;
  };

  return {
    transferToNamada,
    assertValid,
    gasConfig,
    transferStatus: performIbcTransfer.status,
  };
};
