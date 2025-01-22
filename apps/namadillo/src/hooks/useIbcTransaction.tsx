import { SigningStargateClient } from "@cosmjs/stargate";
import { QueryStatus } from "@tanstack/query-core";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { TokenCurrency } from "App/Common/TokenCurrency";
import {
  broadcastIbcTransactionAtom,
  createStargateClient,
  getShieldedArgs,
  getSignedMessage,
  queryAndStoreRpc,
} from "atoms/integrations";
import {
  createNotificationId,
  dispatchToastNotificationAtom,
} from "atoms/notifications";
import BigNumber from "bignumber.js";
import invariant from "invariant";
import { useAtomValue, useSetAtom } from "jotai";
import {
  createIbcTransferMessage,
  createTransferDataFromIbc,
} from "lib/transactions";
import { useState } from "react";
import {
  Address,
  AddressWithAssetAndAmount,
  ChainRegistryEntry,
  GasConfig,
  IbcTransferStage,
  TransferStep,
  TransferTransactionData,
} from "types";
import { toBaseAmount } from "utils";
import { sanitizeAddress } from "utils/address";
import { getKeplrWallet, sanitizeChannel } from "utils/ibc";
import { useSimulateIbcTransferFee } from "./useSimulateIbcTransferFee";

type useIbcTransactionProps = {
  sourceAddress?: string;
  registry?: ChainRegistryEntry;
  sourceChannel?: string;
  shielded?: boolean;
  destinationChannel?: Address;
  selectedAsset?: AddressWithAssetAndAmount;
};

type useIbcTransactionOutput = {
  transferToNamada: (
    destinationAddress: string,
    displayAmount: BigNumber,
    memo?: string,
    onUpdateStatus?: (status: string) => void
  ) => Promise<TransferTransactionData>;
  transferStatus: "idle" | QueryStatus;
  gasConfig: UseQueryResult<GasConfig>;
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
  const [rpcUrl, setRpcUrl] = useState<string | undefined>();
  const [stargateClient, setStargateClient] = useState<
    SigningStargateClient | undefined
  >();

  // Avoid the same client being created twice for the same chain and provide
  // a way to refetch the query in case it throws an error trying to connect to the RPC
  useQuery({
    queryKey: ["store-stargate-client", registry?.chain.chain_id],
    enabled: Boolean(registry?.chain),
    queryFn: async () => {
      invariant(registry?.chain, "Error: Invalid chain");
      setRpcUrl(undefined);
      setStargateClient(undefined);
      return await queryAndStoreRpc(registry.chain, async (rpc: string) => {
        const client = await createStargateClient(rpc, registry.chain);
        setStargateClient(client);
        setRpcUrl(rpc);
        return client;
      });
    },
  });

  const gasConfigQuery = useSimulateIbcTransferFee({
    stargateClient,
    registry,
    selectedAsset,
    isShieldedTransfer: shielded,
    sourceAddress,
    channel: sourceChannel,
  });

  const dispatchPendingTxNotification = (tx: TransferTransactionData): void => {
    invariant(tx.hash, "Error: Transaction hash not provided");
    dispatchNotification({
      id: createNotificationId(tx.hash),
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
      id: createNotificationId(txHash),
      title: "IBC transfer transaction failed",
      description: "",
      details: error instanceof Error ? error.message : undefined,
      type: "error",
    });
  };

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
    invariant(stargateClient, "Error: Stargate client not initialized");
    invariant(rpcUrl, "Error: RPC URL not initialized");
    invariant(
      !shielded || destinationChannel,
      "Error: Destination channel not provided"
    );

    // Set Keplr option to allow Namadillo to set the transaction fee
    const baseKeplr = getKeplrWallet();
    const savedKeplrOptions = baseKeplr.defaultOptions;
    baseKeplr.defaultOptions = {
      sign: {
        preferNoSetFee: true,
      },
    };

    try {
      const baseAmount = toBaseAmount(selectedAsset.asset, displayAmount);

      // This step might require a bit of time
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

      const chainId = registry.chain.chain_id;
      const transferMsg = createIbcTransferMessage(
        sanitizeChannel(sourceChannel!),
        sanitizeAddress(sourceAddress),
        sanitizeAddress(maspCompatibleReceiver),
        baseAmount,
        selectedAsset.originalAddress,
        maspCompatibleMemo
      );

      // In case the first estimate has failed for some reason, we try to refetch
      const gasConfig = await (async () => {
        if (!gasConfigQuery.data) {
          onUpdateStatus?.("Estimating required gas...");
          return (await gasConfigQuery.refetch()).data;
        }
        return gasConfigQuery.data;
      })();
      invariant(gasConfig, "Error: Failed to estimate gas usage");

      onUpdateStatus?.("Waiting for signature...");
      const signedMessage = await getSignedMessage(
        stargateClient,
        transferMsg,
        gasConfig
      );

      onUpdateStatus?.("Broadcasting transaction...");
      const txResponse = await broadcastIbcTx.mutateAsync({
        client: stargateClient,
        tx: signedMessage,
      });

      const tx = createTransferDataFromIbc(
        txResponse,
        rpcUrl || "",
        selectedAsset.asset,
        chainId,
        getIbcTransferStage(!!shielded)
      );
      dispatchPendingTxNotification(tx);
      setTxHash(tx.hash);
      return tx;
    } catch (err) {
      dispatchErrorTxNotification(err);
      throw err;
    } finally {
      baseKeplr.defaultOptions = savedKeplrOptions;
    }
  };

  return {
    transferToNamada,
    gasConfig: gasConfigQuery,
    transferStatus: broadcastIbcTx.status,
  };
};
