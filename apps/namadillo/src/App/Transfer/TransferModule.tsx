import { Chain, Chains } from "@chain-registry/types";
import { ActionButton, Stack } from "@namada/components";
import { mapUndefined } from "@namada/utils";
import { InlineError } from "App/Common/InlineError";
import BigNumber from "bignumber.js";
import { useMemo, useState } from "react";
import {
  Address,
  AddressWithAssetAndAmount,
  AddressWithAssetAndAmountMap,
  WalletProvider,
} from "types";
import { parseChainInfo } from "./common";
import { IbcChannels } from "./IbcChannels";
import { SelectAssetModal } from "./SelectAssetModal";
import { SelectChainModal } from "./SelectChainModal";
import { SelectWalletModal } from "./SelectWalletModal";
import { TransferArrow } from "./TransferArrow";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";

export type TransactionFee = AddressWithAssetAndAmount;

type TransferModuleConfig = {
  wallet?: WalletProvider;
  walletAddress?: string;
  availableWallets?: WalletProvider[];
  onChangeWallet?: (wallet: WalletProvider) => void;
  connected?: boolean;
  availableChains?: Chains;
  chain?: Chain;
  onChangeChain?: (chain: Chain) => void;
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
};

export type TransferSourceProps = TransferModuleConfig & {
  availableAssets?: AddressWithAssetAndAmountMap;
  isLoadingAssets?: boolean;
  selectedAssetAddress?: Address;
  availableAmount?: BigNumber;
  onChangeSelectedAsset?: (address: Address | undefined) => void;
  amount?: BigNumber;
  onChangeAmount?: (amount: BigNumber | undefined) => void;
};

export type IbcOptions = {
  sourceChannel: string;
  onChangeSourceChannel: (channel: string) => void;
  destinationChannel?: string;
  onChangeDestinationChannel?: (channel: string) => void;
};

export type TransferDestinationProps = TransferModuleConfig & {
  enableCustomAddress?: boolean;
  customAddress?: Address;
  onChangeCustomAddress?: (address: Address) => void;
  onChangeShielded?: (shielded: boolean) => void;
};

export type OnSubmitTransferParams = {
  amount: BigNumber;
  destinationAddress: Address;
  memo?: string;
};

export type TransferModuleProps = {
  source: TransferSourceProps;
  destination: TransferDestinationProps;
  transactionFee?: TransactionFee;
  isSubmitting?: boolean;
  errorMessage?: string;
  onSubmitTransfer: (params: OnSubmitTransferParams) => void;
} & (
  | { isIbcTransfer?: false; ibcOptions?: undefined }
  | { isIbcTransfer: true; ibcOptions: IbcOptions }
);

type ValidationResult =
  | "NoAmount"
  | "NoSourceWallet"
  | "NoSourceChain"
  | "NoSelectedAsset"
  | "NoDestinationWallet"
  | "NoDestinationChain"
  | "NoTransactionFee"
  | "NotEnoughBalance"
  | "Ok";

export const TransferModule = ({
  source,
  destination,
  transactionFee,
  isSubmitting,
  isIbcTransfer,
  ibcOptions,
  onSubmitTransfer,
  errorMessage,
}: TransferModuleProps): JSX.Element => {
  const [walletSelectorModalOpen, setWalletSelectorModalOpen] = useState(false);
  const [sourceChainModalOpen, setSourceChainModalOpen] = useState(false);
  const [destinationChainModalOpen, setDestinationChainModalOpen] =
    useState(false);
  const [assetSelectorModalOpen, setAssetSelectorModalOpen] = useState(false);
  const [customAddressActive, setCustomAddressActive] = useState(
    destination.enableCustomAddress && !destination.availableWallets
  );

  const [memo, setMemo] = useState<undefined | string>("");

  const selectedAsset = mapUndefined(
    (address) => source.availableAssets?.[address],
    source.selectedAssetAddress
  );

  const requiresIbcChannels =
    isIbcTransfer &&
    (!ibcOptions?.sourceChannel ||
      (destination.isShielded && !ibcOptions.destinationChannel));

  const availableAmountMinusFees = useMemo(() => {
    const { selectedAssetAddress, availableAmount } = source;

    if (
      typeof selectedAssetAddress === "undefined" ||
      typeof availableAmount === "undefined"
    ) {
      return undefined;
    }

    const minusFees =
      (
        transactionFee &&
        selectedAssetAddress === transactionFee.originalAddress
      ) ?
        availableAmount.minus(transactionFee.amount)
      : availableAmount;

    return BigNumber.max(minusFees, 0);
  }, [source.selectedAssetAddress, source.availableAmount, transactionFee]);

  const validationResult = useMemo((): ValidationResult => {
    if (!source.wallet) {
      return "NoSourceWallet";
    } else if (!source.chain) {
      return "NoSourceChain";
    } else if (!destination.chain) {
      return "NoDestinationChain";
    } else if (!source.selectedAssetAddress) {
      return "NoSelectedAsset";
    } else if (!source.amount || source.amount.eq(0)) {
      return "NoAmount";
    } else if (!transactionFee) {
      return "NoTransactionFee";
    } else if (
      !availableAmountMinusFees ||
      source.amount.gt(availableAmountMinusFees)
    ) {
      return "NotEnoughBalance";
    } else if (!destination.wallet && !destination.customAddress) {
      return "NoDestinationWallet";
    } else {
      return "Ok";
    }
  }, [source, destination, transactionFee, availableAmountMinusFees]);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const address = destination.customAddress || destination.walletAddress;
    if (!source.amount) {
      throw new Error("Amount is not valid");
    }

    if (!address) {
      throw new Error("Address is not provided");
    }

    if (!source.selectedAssetAddress) {
      throw new Error("Asset is not selected");
    }

    const params: OnSubmitTransferParams = {
      amount: source.amount,
      destinationAddress: address.trim(),
      memo,
    };

    onSubmitTransfer?.(params);
  };

  const onChangeWallet = (config: TransferModuleConfig) => (): void => {
    // No callback available, do nothing
    if (!config.onChangeWallet) return;

    // User may choose between multiple options
    if ((config.availableWallets || []).length > 1) {
      setWalletSelectorModalOpen(true);
      return;
    }

    // Fallback to default wallet prop
    if (!config.availableWallets && config.wallet) {
      config.onChangeWallet(config.wallet);
      return;
    }

    // Do nothing if no alternatives are provided
    if (!config.availableWallets) {
      return;
    }

    // Do nothing if wallet address is set, and no other wallet is available
    if (config.walletAddress && config.availableWallets.length <= 1) {
      return;
    }

    // Don't need to show the modal, connects directly
    if (!config.walletAddress && config.availableWallets.length === 1) {
      config.onChangeWallet(config.availableWallets[0]);
      return;
    }
  };

  const getButtonText = (): string => {
    if (isSubmitting) {
      return "Submitting...";
    }

    if (validationResult === "NoSourceWallet") {
      return "Select Wallet";
    }

    if (
      validationResult === "NoSourceChain" ||
      validationResult === "NoDestinationChain"
    ) {
      return "Select Chain";
    }

    if (
      validationResult === "NoSelectedAsset" &&
      source.onChangeSelectedAsset
    ) {
      return "Select Asset";
    }

    // TODO: this should be updated for nfts
    if (validationResult === "NoAmount") {
      return "Define an amount to transfer";
    }

    if (!availableAmountMinusFees) {
      return "Wallet amount not available";
    }

    if (validationResult === "NoTransactionFee") {
      return "No transaction fee is set";
    }

    if (validationResult === "NotEnoughBalance") {
      return "Not enough balance";
    }

    return "Submit";
  };

  return (
    <>
      <section className="max-w-[480px] mx-auto" role="widget">
        <Stack as="form" onSubmit={onSubmit}>
          <TransferSource
            isConnected={Boolean(source.connected)}
            wallet={source.wallet}
            walletAddress={source.walletAddress}
            asset={selectedAsset?.asset}
            isLoadingAssets={source.isLoadingAssets}
            chain={parseChainInfo(source.chain, source.isShielded)}
            availableAmount={availableAmountMinusFees}
            amount={source.amount}
            openProviderSelector={onChangeWallet(source)}
            openChainSelector={
              source.onChangeChain ?
                () => setSourceChainModalOpen(true)
              : undefined
            }
            openAssetSelector={
              source.onChangeSelectedAsset ?
                () => setAssetSelectorModalOpen(true)
              : undefined
            }
            onChangeAmount={source.onChangeAmount}
            isShielded={source.isShielded}
            onChangeShielded={source.onChangeShielded}
          />
          <i className="flex items-center justify-center w-11 mx-auto -my-8 relative z-10">
            <TransferArrow color={destination.isShielded ? "#FF0" : "#FFF"} />
          </i>
          <TransferDestination
            wallet={destination.wallet}
            walletAddress={destination.walletAddress}
            chain={parseChainInfo(destination.chain, destination.isShielded)}
            isShielded={destination.isShielded}
            isIbcTransfer={isIbcTransfer}
            onChangeShielded={destination.onChangeShielded}
            address={destination.customAddress}
            onToggleCustomAddress={
              destination.enableCustomAddress && destination.availableWallets ?
                setCustomAddressActive
              : undefined
            }
            customAddressActive={customAddressActive}
            openProviderSelector={onChangeWallet(destination)}
            openChainSelector={
              destination.onChangeChain ?
                () => setDestinationChainModalOpen(true)
              : undefined
            }
            onChangeAddress={destination.onChangeCustomAddress}
            memo={memo}
            onChangeMemo={setMemo}
            transactionFee={transactionFee}
          />
          {isIbcTransfer && requiresIbcChannels && (
            <IbcChannels
              isShielded={Boolean(source.isShielded || destination.isShielded)}
              sourceChannel={ibcOptions.sourceChannel}
              onChangeSource={ibcOptions.onChangeSourceChannel}
              destinationChannel={ibcOptions.destinationChannel}
              onChangeDestination={ibcOptions.onChangeDestinationChannel}
            />
          )}
          <InlineError errorMessage={errorMessage} />
          <ActionButton
            backgroundColor={
              destination.isShielded || source.isShielded ? "yellow" : "white"
            }
            disabled={validationResult !== "Ok" || isSubmitting}
          >
            {getButtonText()}
          </ActionButton>
        </Stack>
      </section>

      {walletSelectorModalOpen &&
        source.onChangeWallet &&
        source.availableWallets && (
          <SelectWalletModal
            availableWallets={source.availableWallets}
            onClose={() => setWalletSelectorModalOpen(false)}
            onConnect={source.onChangeWallet}
          />
        )}

      {assetSelectorModalOpen &&
        source.onChangeSelectedAsset &&
        source.wallet &&
        source.walletAddress && (
          <SelectAssetModal
            onClose={() => setAssetSelectorModalOpen(false)}
            assets={Object.values(source.availableAssets || {})}
            onSelect={source.onChangeSelectedAsset}
            wallet={source.wallet}
            walletAddress={source.walletAddress}
          />
        )}

      {sourceChainModalOpen &&
        source.onChangeChain &&
        source.wallet &&
        source.walletAddress && (
          <SelectChainModal
            onClose={() => setSourceChainModalOpen(false)}
            chains={source.availableChains || []}
            onSelect={source.onChangeChain}
            wallet={source.wallet}
            walletAddress={source.walletAddress}
          />
        )}

      {destinationChainModalOpen &&
        destination.onChangeChain &&
        destination.wallet &&
        destination.walletAddress && (
          <SelectChainModal
            onClose={() => setDestinationChainModalOpen(false)}
            chains={destination.availableChains || []}
            onSelect={destination.onChangeChain}
            wallet={destination.wallet}
            walletAddress={destination.walletAddress}
          />
        )}
    </>
  );
};
