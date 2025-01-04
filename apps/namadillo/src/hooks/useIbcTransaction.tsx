import { useMemo, useState } from "react";
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
import { TokenCurrency } from "App/Common/TokenCurrency";
import { ibcTransferAtom } from "atoms/integrations";
import {
  createIbcNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import BigNumber from "bignumber.js";
import { getIbcGasConfig } from "integrations/utils";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";

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
  const dispatchNotification = useSetAtom(dispatchToastNotificationAtom);
  const [txHash, setTxHash] = useState<string | undefined>();

  const dispatchPendingTxNotification = (tx: TransferTransactionData): void => {
    invariant(tx.hash, "Error: Transaction hash not provided");
    dispatchNotification({
      id: createIbcNotificationId(tx.hash),
      title: "IBC transfer transaction in progress",
      description: (
        <>
          Your transfer transaction of{" "}
          <TokenCurrency amount={tx.displayAmount} symbol={tx.asset.symbol} />{" "}
          is being processed
        </>
      ),
      type: "pending",
    });
  };

  const dispatchErrorTxNotification = (error: unknown): void => {
    if (!txHash) return;
    dispatchNotification({
      id: createIbcNotificationId(txHash),
      title: "IBC transfer transaction failed",
      description: "",
      details: error instanceof Error ? error.message : undefined,
      type: "error",
    });
  };

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
      dispatchPendingTxNotification(tx);
      setTxHash(tx.hash);
    } catch (err) {
      dispatchErrorTxNotification(err);
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
