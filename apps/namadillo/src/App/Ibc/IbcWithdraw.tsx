import { Chain } from "@chain-registry/types";
import { IbcTransferMsgValue } from "@namada/types";
import { mapUndefined } from "@namada/utils";
import { TransferTransactionTimeline } from "App/Transactions/TransferTransactionTimeline";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { defaultAccountAtom } from "atoms/accounts";
import { namadaTransparentAssetsAtom } from "atoms/balance";
import { defaultGasConfigFamily } from "atoms/fees";
import {
  availableChainsAtom,
  chainRegistryAtom,
  createIbcTxAtom,
  ibcChannelsFamily,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useTransaction } from "hooks/useTransaction";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import { useAtomValue } from "jotai";
import { TransactionPair } from "lib/query";
import { useCallback, useEffect, useRef, useState } from "react";
import namadaChainRegistry from "registry/namada.json";
import { Address, IbcTransferTransactionData, TransferStep } from "types";
import { toBaseAmount } from "utils";
import { IbcTopHeader } from "./IbcTopHeader";

const defaultChainId = "cosmoshub-4";
const keplr = new KeplrWalletManager();

export const IbcWithdraw: React.FC = () => {
  const namadaAccount = useAtomValue(defaultAccountAtom);
  const chainRegistry = useAtomValue(chainRegistryAtom);
  const availableChains = useAtomValue(availableChainsAtom);
  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [selectedAssetAddress, setSelectedAssetAddress] = useState<Address>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [customAddress, setCustomAddress] = useState<string>("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [transaction, setTransaction] = useState<IbcTransferTransactionData>();
  const tempTransaction = useRef<IbcTransferTransactionData>();

  const { data: availableAssets } = useAtomValue(namadaTransparentAssetsAtom);

  const { storeTransaction, findByHash, transactions } =
    useTransactionActions();

  const availableAmount = mapUndefined(
    (address) => availableAssets?.[address]?.amount,
    selectedAssetAddress
  );

  const { data: gasConfig } = useAtomValue(
    defaultGasConfigFamily(["IbcTransfer"])
  );

  const {
    walletAddress: keplrAddress,
    connectToChainId,
    chainId,
    registry,
  } = useWalletManager(keplr);

  const onChangeWallet = (): void => {
    connectToChainId(chainId || defaultChainId);
  };

  const { data: ibcChannels } = useAtomValue(
    ibcChannelsFamily(registry?.chain.chain_name)
  );

  useEffect(() => {
    setSourceChannel(ibcChannels?.namadaChannelId || "");
  }, [ibcChannels]);

  // Keep local transaction up to date with the stored transaction
  useEffect(() => {
    if (transaction?.hash) {
      const storedTx = findByHash(transaction.hash);
      if (storedTx) {
        setTransaction(storedTx as IbcTransferTransactionData);
      }
    }
  }, [transactions]);

  const onSuccess = useCallback(
    (tx: TransactionPair<IbcTransferMsgValue>) => {
      if (!tempTransaction.current) return;
      const transactionData: IbcTransferTransactionData = {
        ...tempTransaction.current,
        hash: tx.encodedTxData.txs[0].innerTxHashes[0].toLowerCase(),
        currentStep: TransferStep.IbcWithdraw,
      };
      storeTransaction(transactionData);
    },
    [transaction]
  );

  const { execute: performWithdraw, isPending } = useTransaction({
    eventType: "IbcTransfer",
    createTxAtom: createIbcTxAtom,
    params: [],
    parsePendingTxNotification: () => ({
      title: "IBC withdrawal transaction in progress",
      description: "Your IBC transaction is being processed",
    }),
    parseErrorTxNotification: () => ({
      title: "IBC withdrawal failed",
      description: "",
    }),
    onError: (err) => {
      setGeneralErrorMessage(err + "");
      setTransaction(undefined);
    },
    onSuccess,
  });

  const submitIbcTransfer = async ({
    displayAmount,
    destinationAddress,
    memo,
  }: OnSubmitTransferParams): Promise<void> => {
    try {
      const selectedAsset = mapUndefined(
        (address) => availableAssets?.[address],
        selectedAssetAddress
      );

      if (typeof selectedAsset === "undefined") {
        throw new Error("No selected asset");
      }

      if (typeof sourceChannel === "undefined") {
        throw new Error("No channel ID is set");
      }

      if (typeof gasConfig === "undefined") {
        throw new Error("No gas config");
      }

      if (typeof keplrAddress === "undefined") {
        throw new Error("No address selected");
      }

      const amountInBaseDenom = toBaseAmount(
        selectedAsset.asset,
        displayAmount
      );

      const tx: IbcTransferTransactionData = {
        rpc: "",
        type: "TransparentToIbc",
        asset: selectedAsset.asset,
        chainId: namadaChainRegistry.chain_id,
        sourcePort: "transfer",
        sourceChannel: sourceChannel.trim(),
        status: "pending",
        memo,
        displayAmount,
        destinationChainId: chainId!,
        sourceAddress: keplrAddress,
        destinationAddress,
        sequence: new BigNumber(0),
        createdAt: new Date(),
        updatedAt: new Date(),
        currentStep: TransferStep.Sign,
      };
      setTransaction(tx);
      tempTransaction.current = { ...tx };
      await performWithdraw({
        params: [
          {
            amountInBaseDenom,
            channelId: sourceChannel.trim(),
            portId: "transfer",
            token: selectedAsset.originalAddress,
            source: keplrAddress,
            receiver: destinationAddress,
            memo,
          },
        ],
      });
    } catch (err) {
      setGeneralErrorMessage(err + "");
      setTransaction(undefined);
    }
  };

  const onChangeChain = (chain: Chain): void => {
    connectToChainId(chain.chain_id);
  };

  const requiresIbcChannels = !ibcChannels?.cosmosChannelId;
  return (
    <div className="relative min-h-[600px]">
      {!transaction && (
        <>
          <header className="flex flex-col items-center text-center mb-3 gap-6">
            <IbcTopHeader type="namToIbc" isShielded={false} />
            <div className="max-w-[360px] mx-auto mb-3">
              <h2 className="mb-1 text-lg font-light">
                Withdraw assets from Namada via IBC
              </h2>
              <p className="text-sm font-light leading-tight">
                To withdraw shielded assets please unshield them to your
                transparent account
              </p>
            </div>
          </header>
          <TransferModule
            source={{
              wallet: wallets.namada,
              walletAddress: namadaAccount.data?.address,
              chain: namadaChainRegistry as Chain,
              isShielded: false,
              availableAssets,
              availableAmount,
              selectedAssetAddress,
              onChangeSelectedAsset: setSelectedAssetAddress,
              amount,
              onChangeAmount: setAmount,
            }}
            destination={{
              wallet: wallets.keplr,
              walletAddress: keplrAddress,
              availableWallets: [wallets.keplr],
              availableChains,
              enableCustomAddress: true,
              customAddress,
              onChangeCustomAddress: setCustomAddress,
              chain: mapUndefined((id) => chainRegistry[id]?.chain, chainId),
              onChangeWallet,
              onChangeChain,
              isShielded: false,
            }}
            isSubmitting={isPending}
            isIbcTransfer={true}
            requiresIbcChannels={requiresIbcChannels}
            ibcOptions={{
              sourceChannel,
              onChangeSourceChannel: setSourceChannel,
            }}
            onSubmitTransfer={submitIbcTransfer}
            gasConfig={gasConfig}
            errorMessage={generalErrorMessage}
          />
        </>
      )}
      {transaction && (
        <div className={clsx("absolute z-50 py-12 left-0 top-0 w-full h-full")}>
          <TransferTransactionTimeline transaction={transaction} />
        </div>
      )}
    </div>
  );
};
