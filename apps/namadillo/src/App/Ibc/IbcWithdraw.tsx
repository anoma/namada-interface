import { Asset, Chain } from "@chain-registry/types";
import { AccountType, IbcTransferMsgValue } from "@namada/types";
import { mapUndefined } from "@namada/utils";
import { params, routes } from "App/routes";
import {
  OnSubmitTransferParams,
  TransferModule,
} from "App/Transfer/TransferModule";
import {
  allDefaultAccountsAtom,
  defaultAccountAtom,
  disposableSignerAtom,
} from "atoms/accounts";
import {
  namadaShieldedAssetsAtom,
  namadaTransparentAssetsAtom,
} from "atoms/balance";
import { chainAtom, chainTokensAtom } from "atoms/chain";
import {
  getDenomFromIbcTrace,
  ibcChannelsFamily,
  searchChainByDenom,
} from "atoms/integrations";
import { ledgerStatusDataAtom } from "atoms/ledger";
import { createIbcTxAtom } from "atoms/transfer/atoms";
import {
  clearDisposableSigner,
  persistDisposableSigner,
} from "atoms/transfer/services";
import BigNumber from "bignumber.js";
import { useTransaction } from "hooks/useTransaction";
import { useTransactionActions } from "hooks/useTransactionActions";
import { useUrlState } from "hooks/useUrlState";
import { useWalletManager } from "hooks/useWalletManager";
import { wallets } from "integrations";
import { KeplrWalletManager } from "integrations/Keplr";
import invariant from "invariant";
import { useAtom, useAtomValue } from "jotai";
import { TransactionPair } from "lib/query";
import { useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import namadaChainRegistry from "registry/namada.json";
import { IbcTransferTransactionData, TransferStep } from "types";
import {
  toBaseAmount,
  toDisplayAmount,
  useTransactionEventListener,
} from "utils";
import { IbcTopHeader } from "./IbcTopHeader";

const defaultChainId = "cosmoshub-4";
const keplr = new KeplrWalletManager();

export const IbcWithdraw = (): JSX.Element => {
  const defaultAccounts = useAtomValue(allDefaultAccountsAtom);
  const shieldedAccount = defaultAccounts.data?.find(
    (account) => account.type === AccountType.ShieldedKeys
  );
  const transparentAccount = useAtomValue(defaultAccountAtom);
  const namadaChain = useAtomValue(chainAtom);
  const [ledgerStatus, setLedgerStatusStop] = useAtom(ledgerStatusDataAtom);

  const [generalErrorMessage, setGeneralErrorMessage] = useState("");
  const [selectedAssetAddress, setSelectedAssetAddress] = useUrlState(
    params.asset
  );
  const [shielded, setShielded] = useState<boolean>(true);
  const [refundTarget, setRefundTarget] = useState<string>();
  const [amount, setAmount] = useState<BigNumber | undefined>();
  const [customAddress, setCustomAddress] = useState<string>("");
  const [sourceChannel, setSourceChannel] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [statusExplanation, setStatusExplanation] = useState("");
  const [completedAt, setCompletedAt] = useState<Date | undefined>();
  const [txHash, setTxHash] = useState<string | undefined>();
  const [destinationChain, setDestinationChain] = useState<Chain | undefined>();
  const { refetch: genDisposableSigner } = useAtomValue(disposableSignerAtom);

  const chainTokens = useAtomValue(chainTokensAtom);

  const { data: availableAssets, isLoading: isLoadingAssets } = useAtomValue(
    shielded ? namadaShieldedAssetsAtom : namadaTransparentAssetsAtom
  );

  const { storeTransaction } = useTransactionActions();
  const navigate = useNavigate();

  const ledgerAccountInfo = ledgerStatus && {
    deviceConnected: ledgerStatus.connected,
    errorMessage: ledgerStatus.errorMessage,
  };

  const availableAmount = mapUndefined(
    (address) => availableAssets?.[address]?.amount,
    selectedAssetAddress
  );

  const selectedAsset =
    selectedAssetAddress ? availableAssets?.[selectedAssetAddress] : undefined;

  const {
    walletAddress: keplrAddress,
    connectToChainId,
    chainId,
    registry,
    loadWalletAddress,
  } = useWalletManager(keplr);

  const onChangeWallet = (): void => {
    if (registry) {
      connectToChainId(registry.chain.chain_id);
      return;
    }
    connectToChainId(defaultChainId);
  };

  useTransactionEventListener("IbcWithdraw.Success", async (e) => {
    if (txHash && e.detail.hash === txHash) {
      setCompletedAt(new Date());
      // We are clearing the disposable signer only if the transaction was successful on the target chain
      if (shielded && refundTarget) {
        await clearDisposableSigner(refundTarget);
      }
    }
  });

  const redirectToTimeline = (): void => {
    if (txHash) {
      navigate(generatePath(routes.transaction, { hash: txHash }));
    }
  };

  const updateDestinationChainAndAddress = (chain: Chain | undefined): void => {
    setDestinationChain(chain);
    if (customAddress) {
      setCustomAddress("");
    }
    if (chain) {
      loadWalletAddress(chain?.chain_id);
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
  // ATOM to Cosmoshub, etc.
  useEffect(() => {
    if (!selectedAsset || !chainTokens.data) {
      updateDestinationChainAndAddress(undefined);
      return;
    }

    const token = chainTokens.data.find(
      (token) => token.address === selectedAsset.originalAddress
    );

    if (token && "trace" in token) {
      const denom = getDenomFromIbcTrace(token.trace);
      const chain = searchChainByDenom(denom);
      updateDestinationChainAndAddress(chain);
      return;
    }

    updateDestinationChainAndAddress(undefined);
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
    useDisposableSigner: shielded,
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
    onBeforeBroadcast: async (tx) => {
      const props = tx.encodedTxData.meta?.props[0];
      if (shielded && props) {
        const refundTarget = props.refundTarget;
        invariant(refundTarget, "Refund target is not provided");

        await persistDisposableSigner(refundTarget);
        setRefundTarget(refundTarget);
      }

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
    onError: async (err, context) => {
      setGeneralErrorMessage(String(err));
      setCurrentStatus("");
      setStatusExplanation("");

      // Clear disposable signer if the transaction failed on Namada side
      // We do not want to clear the disposable signer if the transaction failed on the target chain
      const refundTarget = context?.encodedTxData.meta?.props[0].refundTarget;
      if (shielded && refundTarget) {
        await clearDisposableSigner(refundTarget);
      }
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
      shielded,
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
    invariant(shieldedAccount, "No shielded account is found");
    invariant(transparentAccount.data, "No transparent account is found");

    const amountInBaseDenom = toBaseAmount(selectedAsset.asset, displayAmount);
    const source =
      shielded ?
        shieldedAccount.pseudoExtendedKey!
      : transparentAccount.data.address;
    const gasSpendingKey =
      shielded ? shieldedAccount.pseudoExtendedKey : undefined;

    const refundTarget =
      shielded ? (await genDisposableSigner()).data?.address : undefined;

    setLedgerStatusStop(true);
    try {
      await performWithdraw({
        signer: {
          publicKey: transparentAccount.data.publicKey!,
          address: transparentAccount.data.address!,
        },
        params: [
          {
            amountInBaseDenom,
            channelId: sourceChannel.trim(),
            portId: "transfer",
            token: selectedAsset.originalAddress,
            source,
            receiver: destinationAddress,
            gasSpendingKey,
            memo,
            refundTarget,
          },
        ],
      });
    } finally {
      setLedgerStatusStop(false);
    }
  };

  const requiresIbcChannels = !isLoadingIbcChannels && unknownIbcChannels;

  return (
    <div className="relative min-h-[600px]">
      <header className="flex flex-col items-center text-center mb-10 gap-6">
        <IbcTopHeader type="namToIbc" isShielded={shielded} />
        <h2 className="text-lg">Withdraw assets from Namada via IBC</h2>
      </header>
      <TransferModule
        source={{
          isLoadingAssets,
          wallet: wallets.namada,
          walletAddress:
            shielded ?
              shieldedAccount?.address
            : transparentAccount.data?.address,
          chain: namadaChainRegistry as Chain,
          isShieldedAddress: shielded,
          availableChains: [namadaChainRegistry as Chain],
          availableAssets,
          availableAmount,
          selectedAssetAddress,
          onChangeSelectedAsset: setSelectedAssetAddress,
          onChangeShielded: setShielded,
          amount,
          onChangeAmount: setAmount,
          ledgerAccountInfo,
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
          isShieldedAddress: false,
        }}
        isShieldedTx={shielded}
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
