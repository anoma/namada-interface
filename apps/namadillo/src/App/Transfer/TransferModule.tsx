import { Asset, Chain, Chains } from "@chain-registry/types";
import { ActionButton, Stack } from "@namada/components";
import { InlineError } from "App/Common/InlineError";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { WalletProvider } from "types";
import { toBaseAmount, toDisplayAmount } from "utils";
import { parseChainInfo } from "./common";
import { IbcChannels } from "./IbcChannels";
import { SelectAssetModal } from "./SelectAssetModal";
import { SelectChainModal } from "./SelectChainModal";
import { SelectWalletModal } from "./SelectWalletModal";
import { TransferArrow } from "./TransferArrow";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";

export type TransactionFee = {
  token: Asset;
  amount: BigNumber;
};

export type TransferModuleConfig = {
  wallet?: WalletProvider;
  walletAddress?: string;
  availableWallets?: WalletProvider[];
  onChangeWallet?: (wallet: WalletProvider) => void;
  connected?: boolean;
  availableChains?: Chains;
  chain?: Chain;
  onChangeChain?: (chain: Chain) => void;
  isShielded?: boolean;
  errorMessage?: string;
};

export type TransferSourceProps = TransferModuleConfig & {
  availableAssets?: Asset[];
  isLoadingAssets?: boolean;
  selectedAsset?: Asset;
  availableAmount?: BigNumber;
  onChangeSelectedAsset?: (asset: Asset | undefined) => void;
};

export type IbcOptions = {
  destinationChannel: string;
  sourceChannel: string;
};

export type TransferDestinationProps = TransferModuleConfig & {
  enableCustomAddress?: boolean;
  onChangeShielded?: (shielded: boolean) => void;
};

export type OnSubmitTransferParams = {
  amount: BigNumber;
  destinationAddress: string;
  memo?: string;
  ibcOptions?: IbcOptions;
};

export type TransferModuleProps = {
  source: TransferSourceProps;
  destination: TransferDestinationProps;
  transactionFee?: TransactionFee;
  isSubmitting?: boolean;
  isIbcTransfer?: boolean;
  errorMessage?: string;
  onSubmitTransfer: (params: OnSubmitTransferParams) => void;
};

export const TransferModule = ({
  source,
  destination,
  transactionFee,
  isSubmitting,
  isIbcTransfer,
  onSubmitTransfer,
  errorMessage,
}: TransferModuleProps): JSX.Element => {
  const [walletSelectorModalOpen, setWalletSelectorModalOpen] = useState(false);
  const [sourceChainModalOpen, setSourceChainModalOpen] = useState(false);
  const [destinationChainModalOpen, setDestinationChainModalOpen] =
    useState(false);
  const [assetSelectorModalOpen, setAssetSelectorModalOpen] = useState(false);
  const [customAddressActive, setCustomAddressActive] = useState(false);
  const [memo, setMemo] = useState<undefined | string>("");
  const [customAddress, setCustomAddress] = useState<undefined | string>("");
  const [amount, setAmount] = useState<BigNumber | undefined>(new BigNumber(0));
  const [sourceIbcChannel, setSourceIbcChannel] = useState("");
  const [destinationIbcChannel, setDestinationIbcChannel] = useState("");

  const availableAmount =
    source.selectedAsset ?
      toDisplayAmount(
        source.selectedAsset,
        new BigNumber(source.availableAmount || 0)
      )
    : undefined;

  const validateTransfer = (): boolean => {
    if (!amount || amount.eq(0)) return false;
    if (!source.wallet || !source.chain || !source.selectedAsset) return false;
    if (!destination.wallet || !destination.chain) return false;
    if (!availableAmount || availableAmount.lt(amount)) {
      return false;
    }
    return true;
  };

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const address = customAddress || destination.walletAddress;
    if (!amount) {
      throw new Error("Amount is not valid");
    }

    if (!address) {
      throw new Error("Address is not provided");
    }

    if (!source.selectedAsset) {
      throw new Error("Asset is not selected");
    }

    const params: OnSubmitTransferParams = {
      amount: toBaseAmount(source.selectedAsset, amount),
      destinationAddress: address.trim(),
      memo,
    };

    if (isIbcTransfer) {
      params.ibcOptions = {
        sourceChannel: sourceIbcChannel.trim(),
        destinationChannel: destinationIbcChannel.trim(),
      };
    }

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

    if (!source.wallet) {
      return "Select Wallet";
    }

    if (!source.chain || !destination.chain) {
      return "Select Chain";
    }

    if (!source.selectedAsset && source.onChangeSelectedAsset) {
      return "Select Asset";
    }

    // TODO: this should be updated for nfts
    if (!amount || amount.eq(0)) {
      return "Define an amount to transfer";
    }

    // TODO: amount + fee < available amount

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
            asset={source.selectedAsset}
            isLoadingAssets={source.isLoadingAssets}
            chain={parseChainInfo(source.chain, source.isShielded)}
            availableAmount={availableAmount}
            amount={amount}
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
            onChangeAmount={setAmount}
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
            address={customAddress}
            onToggleCustomAddress={
              destination.enableCustomAddress ?
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
            onChangeAddress={setCustomAddress}
            memo={memo}
            onChangeMemo={setMemo}
            transactionFee={transactionFee}
          />
          {isIbcTransfer && (
            <IbcChannels
              isShielded={Boolean(source.isShielded || destination.isShielded)}
              sourceChannel={sourceIbcChannel}
              onChangeSource={setSourceIbcChannel}
              destinationChannel={destinationIbcChannel}
              onChangeDestination={setDestinationIbcChannel}
            />
          )}
          <InlineError errorMessage={errorMessage} />
          <ActionButton
            backgroundColor={
              destination.isShielded || source.isShielded ? "yellow" : "white"
            }
            disabled={!source.wallet || !validateTransfer() || isSubmitting}
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
            assets={source.availableAssets || []}
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
