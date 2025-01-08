import { useMemo, useState } from "react";
import {
  Address,
  AddressWithAssetAndAmount,
  ChainRegistryEntry,
  GasConfig,
  IbcTransferStage,
  TransferStep,
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

import { QueryStatus } from "@tanstack/query-core";
import { TokenCurrency } from "App/Common/TokenCurrency";
import {
  broadcastIbcTransactionAtom,
  createStargateClient,
  getShieldedArgs,
  getSignedMessage,
  queryAndStoreRpc,
} from "atoms/integrations";
import {
  createIbcNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import BigNumber from "bignumber.js";
import { getIbcGasConfig } from "integrations/utils";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import { createTransferDataFromIbc } from "lib/transactions";
import { toBaseAmount } from "utils";
import { sanitizeAddress } from "utils/address";
import { getKeplrWallet, sanitizeChannel } from "utils/ibc";

type useIbcTransactionOutput = {
  transferToNamada: (
    destinationAddress: string,
    displayAmount: BigNumber,
    memo?: string,
    onUpdateStatus?: (status: string) => void
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
  const broadcastIbcTx = useAtomValue(broadcastIbcTransactionAtom);
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

  const getIbcTransferStage = (shielded: boolean): IbcTransferStage => {
    return shielded ?
        { type: "IbcToShielded", currentStep: TransferStep.IbcToShielded }
      : {
          type: "IbcToTransparent",
          currentStep: TransferStep.IbcToTransparent,
        };
  };

  const transferToNamada = async (
    destinationAddress: Address,
    displayAmount: BigNumber,
    memo: string = "",
    onUpdateStatus?: (status: string) => void
  ): Promise<TransferTransactionData> => {
    invariant(sourceAddress, "Error: Source address is not defined");
    invariant(selectedAsset, "Error: No asset is selected");
    invariant(registry, "Error: Invalid chain");
    invariant(sourceChannel, "Error: Invalid IBC source channel");
    invariant(gasConfig, "Error: No transaction fee is set");
    invariant(
      !shielded || destinationChannel,
      "Error: Destination channel not provided"
    );

    const baseKeplr = getKeplrWallet();
    const savedKeplrOptions = baseKeplr.defaultOptions;
    baseKeplr.defaultOptions = {
      sign: {
        preferNoSetFee: true,
      },
    };

    try {
      const baseAmount = toBaseAmount(selectedAsset.asset, displayAmount);
      const { memo: maspCompatibleMemo, receiver: maspCompatibleReceiver } =
        await (async () => {
          onUpdateStatus?.("Generating MASP parameters...");
          return shielded ?
              await getShieldedArgs(
                destinationAddress,
                selectedAsset.originalAddress,
                baseAmount,
                destinationChannel!
              )
            : { memo, receiver: destinationAddress };
        })();

      // Set Keplr option to allow Namadillo to set the transaction fee
      const chainId = registry.chain.chain_id;

      return await queryAndStoreRpc(registry.chain, async (rpc: string) => {
        onUpdateStatus?.("Waiting for signature...");
        const client = await createStargateClient(rpc, registry.chain);
        const ibcTransferParams = {
          signer: baseKeplr.getOfflineSigner(chainId),
          chainId,
          sourceAddress: sanitizeAddress(sourceAddress),
          destinationAddress: sanitizeAddress(maspCompatibleReceiver),
          amount: displayAmount,
          asset: selectedAsset,
          gasConfig,
          sourceChannelId: sanitizeChannel(sourceChannel!),
          destinationChannelId: sanitizeChannel(destinationChannel!) || "",
          isShielded: !!shielded,
        };

        const signedMessage = await getSignedMessage(
          client,
          ibcTransferParams,
          maspCompatibleMemo
        );

        onUpdateStatus?.("Broadcasting transaction...");
        const txResponse = await broadcastIbcTx.mutateAsync({
          client,
          tx: signedMessage,
        });

        const tx = createTransferDataFromIbc(
          txResponse,
          rpc,
          selectedAsset.asset,
          chainId,
          getIbcTransferStage(!!shielded)
        );
        dispatchPendingTxNotification(tx);
        setTxHash(tx.hash);
        return tx;
      });
    } catch (err) {
      dispatchErrorTxNotification(err);
      throw err;
    } finally {
      baseKeplr.defaultOptions = savedKeplrOptions;
    }
  };

  return {
    transferToNamada,
    gasConfig,
    transferStatus: broadcastIbcTx.status,
  };
};
