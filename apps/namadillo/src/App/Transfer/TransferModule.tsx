import { Chain, Chains } from "@chain-registry/types";
import { ActionButton, Stack } from "@namada/components";
import { mapUndefined } from "@namada/utils";
import { InlineError } from "App/Common/InlineError";
import BigNumber from "bignumber.js";
import { TransactionFeeProps } from "hooks/useTransactionFee";
import { useMemo, useState } from "react";
import {
  Address,
  AddressWithAssetAndAmountMap,
  GasConfig,
  WalletProvider,
} from "types";
import { getDisplayGasFee } from "utils/gas";
import { parseChainInfo } from "./common";
import { IbcChannels } from "./IbcChannels";
import { SelectAssetModal } from "./SelectAssetModal";
import { SelectChainModal } from "./SelectChainModal";
import { SelectWalletModal } from "./SelectWalletModal";
import { TransferArrow } from "./TransferArrow";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";

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
  displayAmount: BigNumber;
  destinationAddress: Address;
  memo?: string;
};

export type TransferModuleProps = {
  source: TransferSourceProps;
  destination: TransferDestinationProps;
  requiresIbcChannels?: boolean;
  gasConfig?: GasConfig;
  feeProps?: TransactionFeeProps;
  changeFeeEnabled?: boolean;
  submittingText?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  onSubmitTransfer: (params: OnSubmitTransferParams) => void;
  buttonTextErrors?: Partial<Record<ValidationResult, string>>;
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
  gasConfig: gasConfigProp,
  feeProps,
  changeFeeEnabled,
  submittingText,
  isSubmitting,
  isIbcTransfer,
  ibcOptions,
  requiresIbcChannels,
  onSubmitTransfer,
  errorMessage,
  buttonTextErrors = {},
}: TransferModuleProps): JSX.Element => {
  const gasConfig = gasConfigProp ?? feeProps?.gasConfig;

  const [walletSelectorModalOpen, setWalletSelectorModalOpen] = useState(false);
  const [sourceChainModalOpen, setSourceChainModalOpen] = useState(false);
  const [destinationChainModalOpen, setDestinationChainModalOpen] =
    useState(false);
  const [assetSelectorModalOpen, setAssetSelectorModalOpen] = useState(false);
  const [customAddressActive, setCustomAddressActive] = useState(
    destination.enableCustomAddress && !destination.availableWallets
  );

  const [memo, setMemo] = useState<undefined | string>();

  const selectedAsset = mapUndefined(
    (address) => source.availableAssets?.[address],
    source.selectedAssetAddress
  );

  const availableAmountMinusFees = useMemo(() => {
    const { selectedAssetAddress, availableAmount } = source;

    if (
      typeof selectedAssetAddress === "undefined" ||
      typeof availableAmount === "undefined"
    ) {
      return undefined;
    }

    if (!gasConfig || gasConfig.gasToken !== selectedAssetAddress) {
      return availableAmount;
    }

    const totalFees = getDisplayGasFee(gasConfig);
    const amountMinusFees = availableAmount.minus(totalFees);
    return BigNumber.max(amountMinusFees, 0);
  }, [source.selectedAssetAddress, source.availableAmount, gasConfig]);

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
  }, [source, destination, gasConfig, availableAmountMinusFees]);

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
      displayAmount: source.amount,
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

    setWalletSelectorModalOpen(true);
  };

  const getButtonTextError = (
    id: ValidationResult,
    defaultText: string
  ): string => {
    if (buttonTextErrors.hasOwnProperty(id) && buttonTextErrors[id]) {
      return buttonTextErrors[id];
    }

    return defaultText;
  };

  const getButtonText = (): string => {
    if (isSubmitting) {
      return submittingText || "Submitting...";
    }

    const getText = getButtonTextError.bind(null, validationResult);
    switch (validationResult) {
      case "NoSourceWallet":
        return getText("Select Wallet");

      case "NoSourceChain":
      case "NoDestinationChain":
        return getText("Select Chain");

      case "NoSelectedAsset":
        return getText("Select Asset");

      case "NoDestinationWallet":
        return getText("Select Destination Wallet");

      case "NoAmount":
        return getText("Define an amount to transfer");

      case "NoTransactionFee":
        return getText("No transaction fee is set");

      case "NotEnoughBalance":
        return getText("Not enough balance");
    }

    if (!availableAmountMinusFees) {
      return getText("Wallet amount not available");
    }

    return "Submit";
  };

  const buttonColor =
    destination.isShielded || source.isShielded ? "yellow" : "white";

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
            availableAmount={source.availableAmount}
            availableAmountMinusFees={availableAmountMinusFees}
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
            gasConfig={gasConfig}
            feeProps={feeProps}
            changeFeeEnabled={changeFeeEnabled}
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
            outlineColor={buttonColor}
            backgroundColor={buttonColor}
            backgroundHoverColor="transparent"
            textColor="black"
            textHoverColor={buttonColor}
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

      {sourceChainModalOpen && source.onChangeChain && source.wallet && (
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
        destination.wallet && (
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
