import { SigningStargateClient } from "@cosmjs/stargate";
import {
  useMutation,
  UseMutationResult,
  useQuery,
  UseQueryResult,
} from "@tanstack/react-query";
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
  gasConfig: UseQueryResult<GasConfig>;
  transferToNamada: UseMutationResult<
    TransferTransactionData,
    Error,
    IbcTransferProps
  >;
};

type IbcTransferProps = {
  destinationAddress: string;
  displayAmount: BigNumber;
  memo?: string;
  onUpdateStatus?: (status: string) => void;
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

  const transferToNamada = async ({
    destinationAddress,
    displayAmount,
    memo = "",
    onUpdateStatus,
  }: IbcTransferProps): Promise<TransferTransactionData> => {
    invariant(sourceAddress, "Source address is not defined");
    invariant(selectedAsset, "No asset is selected");
    invariant(registry, "Invalid chain");
    invariant(sourceChannel, "Invalid IBC source channel");
    invariant(stargateClient, "Stargate client not initialized");
    invariant(rpcUrl, "RPC URL not initialized");
    invariant(
      !shielded || destinationChannel,
      "Destination channel not provided"
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
      // In case the first estimate has failed for some reason, we try to refetch
      const gasConfig = await (async () => {
        if (!gasConfigQuery.data) {
          onUpdateStatus?.("Estimating required gas...");
          return (await gasConfigQuery.refetch()).data;
        }
        return gasConfigQuery.data;
      })();

      invariant(
        gasConfig,
        "Failed to simulate transaction and obtain gas usage." +
          gasConfigQuery.error?.message
      );

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
        getIbcTransferStage(!!shielded),
        !!shielded
      );
      dispatchPendingTxNotification(tx);
      setTxHash(tx.hash);
      onUpdateStatus?.("Relaying transfer to Namada...");
      return tx;
    } catch (err) {
      dispatchErrorTxNotification(err);
      throw err;
    } finally {
      baseKeplr.defaultOptions = savedKeplrOptions;
    }
  };

  const transferToNamadaQuery = useMutation({
    mutationFn: transferToNamada,
  });

  return {
    transferToNamada: transferToNamadaQuery,
    gasConfig: gasConfigQuery,
  };
};
