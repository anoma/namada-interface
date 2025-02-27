import { Asset, Chain } from "@chain-registry/types";
import { IbcTransferMsgValue } from "@namada/types";
import { mapUndefined } from "@namada/utils";
import { routes } from "App/routes";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import { defaultAccountAtom } from "atoms/accounts";
import { namadaTransparentAssetsAtom } from "atoms/balance";
import { chainAtom, chainTokensAtom } from "atoms/chain";
import {
  createIbcTxAtom,
  getDenomFromIbcTrace,
  ibcChannelsFamily,
  searchChainByDenom,
} from "atoms/integrations";
import BigNumber from "bignumber.js";
import { useTransaction } from "hooks/useTransaction";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import invariant from "invariant";
import { useAtomValue } from "jotai";
import { TransactionPair } from "lib/query";
import { useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import namadaChainRegistry from "registry/namada.json";
import { Address, IbcTransferTransactionData, TransferStep } from "types";
import {
  toBaseAmount,
  toDisplayAmount,
  useTransactionEventListener,
} from "utils";
import { IbcTopHeader } from "./IbcTopHeader";

const defaultChainId = "cosmoshub-4";
const keplr = new KeplrWalletManager();

export const IbcWithdraw: React.FC = () => {
  const namadaAccount = useAtomValue(defaultAccountAtom);
  const namadaChain = useAtomValue(chainAtom);

  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [selectedAssetAddress, setSelectedAssetAddress] = useState<Address>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [customAddress, setCustomAddress] = useState<string>("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [statusExplanation, setStatusExplanation] = useState("");
  const [completedAt, setCompletedAt] = useState<Date | undefined>();
  const [txHash, setTxHash] = useState<string | undefined>();
  const [destinationChain, setDestinationChain] = useState<Chain | undefined>();

  const chainTokens = useAtomValue(chainTokensAtom);

  const { data: availableAssets } = useAtomValue(namadaTransparentAssetsAtom);
  const { storeTransaction } = useTransactionActions();
  const navigate = useNavigate();

  const availableAmount = mapUndefined(
    (address) => availableAssets?.[address]?.amount,
    selectedAssetAddress
  );

  const selectedAsset = mapUndefined(
    (address) => availableAssets?.[address],
    selectedAssetAddress
  );

  const {
    walletAddress: keplrAddress,
    connectToChainId,
    chainId,
    registry,
  } = useWalletManager(keplr);

  const onChangeWallet = (): void => {
    if (registry) {
      connectToChainId(registry.chain.chain_id);
      return;
    }
    connectToChainId(defaultChainId);
  };

  useTransactionEventListener("IbcWithdraw.Success", (e) => {
    if (txHash && e.detail.hash === txHash) {
      setCompletedAt(new Date());
    }
  });

  const redirectToTimeline = (): void => {
    if (txHash) {
      navigate(generatePath(routes.transaction, { hash: txHash }));
    }
  };

  const {
    data: ibcChannels,
    isError: unknownIbcChannels,
    isLoading: isLoadingIbcChannels,
  } = useAtomValue(ibcChannelsFamily(registry?.chain.chain_name));

  useEffect(() => {
    setSourceChannel(ibcChannels?.namadaChannel || "");
  }, [ibcChannels]);

  // Search for original chain. We don't want to enable users to transfer Namada assets
  // to other chains different than the original one. Ex: OSMO should only be withdrew to Osmosis,
  // ATOM to Cosmoshub.
  useEffect(() => {
    if (!selectedAsset || !chainTokens.data) {
      setDestinationChain(undefined);
      return;
    }

    const token = chainTokens.data.find(
      (token) => token.address === selectedAsset.originalAddress
    );

    if (token && "trace" in token) {
      const denom = getDenomFromIbcTrace(token.trace);
      const chain = searchChainByDenom(denom);
      setDestinationChain(chain);
      return;
    }

    setDestinationChain(undefined);
  }, [selectedAsset, chainTokens.data]);

  const {
    execute: performWithdraw,
    feeProps,
    error,
    isPending,
    isSuccess,
  } = useTransaction({
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
    onBeforeBuildTx: () => {
      setCurrentStatus("Creating IBC transaction...");
    },
    onBeforeSign: () => {
      setCurrentStatus("Waiting for signature...");
    },
    onBeforeBroadcast: () => {
      setCurrentStatus("Broadcasting transaction to Namada...");
    },
    onBroadcasted: (tx) => {
      setCurrentStatus("Waiting for confirmation from target chain...");
      setStatusExplanation(
        "This step may take a few minutes, depending on the current workload of the IBC relayers."
      );

      const props = tx.encodedTxData.meta?.props[0];
      invariant(props, "EncodedTxData not provided");
      invariant(selectedAsset, "Selected asset is not defined");
      invariant(chainId, "Chain ID is not provided");
      const displayAmount = toDisplayAmount(
        selectedAsset.asset,
        props.amountInBaseDenom
      );
      const ibcTxData = storeTransferTransaction(
        tx,
        displayAmount,
        chainId,
        selectedAsset.asset
      );
      setTxHash(ibcTxData.hash);
    },
    onError: (err) => {
      setGeneralErrorMessage(String(err));
      setCurrentStatus("");
      setStatusExplanation("");
    },
  });

  const storeTransferTransaction = (
    tx: TransactionPair<IbcTransferMsgValue>,
    displayAmount: BigNumber,
    destinationChainId: string,
    asset: Asset
  ): IbcTransferTransactionData => {
    const props = tx.encodedTxData.meta?.props[0];
    invariant(props, "Invalid transaction data");

    const transferTransaction: IbcTransferTransactionData = {
      hash: tx.encodedTxData.txs[0].innerTxHashes[0].toLowerCase(),
      currentStep: TransferStep.WaitingConfirmation,
      rpc: "",
      type: "TransparentToIbc",
      status: "pending",
      sourcePort: "transfer",
      asset,
      chainId: namadaChain.data?.chainId || "",
      destinationChainId,
      memo: tx.encodedTxData.wrapperTxProps.memo || props.memo,
      displayAmount,
      shielded: false,
      sourceAddress: props.source,
      sourceChannel: props.channelId,
      destinationAddress: props.receiver,
      createdAt: new Date(),
      updatedAt: new Date(),
      sequence: new BigNumber(0),
    };

    storeTransaction(transferTransaction);
    return transferTransaction;
  };

  const submitIbcTransfer = async ({
    displayAmount,
    destinationAddress,
    memo,
  }: OnSubmitTransferParams): Promise<void> => {
    invariant(selectedAsset, "No asset is selected");
    invariant(sourceChannel, "No channel ID is set");
    invariant(chainId, "No chain is selected");
    invariant(keplrAddress, "No address is selected");

    const amountInBaseDenom = toBaseAmount(selectedAsset.asset, displayAmount);
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
  };

  const requiresIbcChannels = !isLoadingIbcChannels && unknownIbcChannels;

  return (
    <div className="relative min-h-[600px]">
      <header className="flex flex-col items-center text-center mb-3 gap-6">
        <IbcTopHeader type="namToIbc" isShielded={false} />
        <div className="max-w-[360px] mx-auto mb-3">
          <h2 className="mb-1 text-lg font-light">
            Withdraw assets from Namada via IBC
          </h2>
          <p className="text-sm font-light leading-tight">
            To withdraw shielded assets please unshield them to your transparent
            account
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
          enableCustomAddress: true,
          customAddress,
          onChangeCustomAddress: setCustomAddress,
          chain: destinationChain,
          onChangeWallet,
          isShielded: false,
        }}
        errorMessage={generalErrorMessage || error?.message || ""}
        currentStatus={currentStatus}
        currentStatusExplanation={statusExplanation}
        isSubmitting={
          isPending ||
          /*Before the transaction was successfully broadcasted (isSuccess) we need to wait
           * from the confirmation event from target chain */
          isSuccess
        }
        isIbcTransfer={true}
        requiresIbcChannels={requiresIbcChannels}
        ibcOptions={{
          sourceChannel,
          onChangeSourceChannel: setSourceChannel,
        }}
        onSubmitTransfer={submitIbcTransfer}
        feeProps={feeProps}
        onComplete={redirectToTimeline}
        completedAt={completedAt}
      />
    </div>
  );
};
