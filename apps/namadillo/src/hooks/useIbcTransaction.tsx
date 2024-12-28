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
import invariant from "invariant";
import { useAtomValue } from "jotai";

type useIbcTransactionOutput = {
  transferToNamada: (
    destinationAddress: string,
    displayAmount: BigNumber
  ) => Promise<TransferTransactionData>;
  transferStatus: "idle" | QueryStatus;
  gasConfig: GasConfig | undefined;
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

  const transferToNamada = async (
    destinationAddress: Address,
    displayAmount: BigNumber
  ): Promise<TransferTransactionData> => {
    invariant(sourceAddress, "Source address is not defined");
    invariant(selectedAsset, "No asset is selected");
    invariant(registry, "Invalid chain");
    invariant(sourceChannel, "Invalid IBC source channel");
    invariant(
      !shielded || destinationChannel,
      "Invalid IBC destination channel"
    );
    invariant(gasConfig, "No transaction fee is set");

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
          sourceAddress,
          destinationAddress,
          amount: displayAmount,
          asset: selectedAsset,
          gasConfig,
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
    gasConfig,
    transferStatus: performIbcTransfer.status,
  };
};
