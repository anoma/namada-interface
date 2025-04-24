import { Chain, Chains } from "@chain-registry/types";
import { ActionButton, Stack } from "@namada/components";
import { mapUndefined } from "@namada/utils";
import { IconTooltip } from "App/Common/IconTooltip";
import { InlineError } from "App/Common/InlineError";
import { routes } from "App/routes";
import { chainAssetsMapAtom } from "atoms/chain";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useKeychainVersion } from "hooks/useKeychainVersion";
import { TransactionFeeProps } from "hooks/useTransactionFee";
import { wallets } from "integrations";
import { useAtomValue } from "jotai";
import { useCallback, useMemo, useState } from "react";
import { BsQuestionCircleFill } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Address,
  AddressWithAssetAndAmount,
  AddressWithAssetAndAmountMap,
  GasConfig,
  LedgerAccountInfo,
  WalletProvider,
} from "types";
import { filterAvailableAsssetsWithBalance } from "utils/assets";
import { checkKeychainCompatibleWithMasp } from "utils/compatibility";
import { getDisplayGasFee } from "utils/gas";
import {
  isShieldedAddress,
  isTransparentAddress,
  parseChainInfo,
} from "./common";
import { CurrentStatus } from "./CurrentStatus";
import { IbcChannels } from "./IbcChannels";
import { SelectAssetModal } from "./SelectAssetModal";
import { SelectChainModal } from "./SelectChainModal";
import { SelectWalletModal } from "./SelectWalletModal";
import { SuccessAnimation } from "./SuccessAnimation";
import { TransferArrow } from "./TransferArrow";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";

type TransferModuleConfig = {
  wallet?: WalletProvider;
  walletAddress?: string;
  availableWallets?: WalletProvider[];
  connected?: boolean;
  availableChains?: Chains;
  chain?: Chain;
  isShieldedAddress?: boolean;
  onChangeWallet?: (wallet: WalletProvider) => void;
  onChangeChain?: (chain: Chain) => void;
  onChangeShielded?: (isShielded: boolean) => void;
  // Additional information if selected account is a ledger
  ledgerAccountInfo?: LedgerAccountInfo;
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
  onSubmitTransfer?: (params: OnSubmitTransferParams) => void;
  requiresIbcChannels?: boolean;
  gasConfig?: GasConfig;
  feeProps?: TransactionFeeProps;
  changeFeeEnabled?: boolean;
  submittingText?: string;
  isSubmitting?: boolean;
  errorMessage?: string;
  currentStatus?: string;
  currentStatusExplanation?: string;
  completedAt?: Date;
  isShieldedTx?: boolean;
  buttonTextErrors?: Partial<Record<ValidationResult, string>>;
  onComplete?: () => void;
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
  | "NotEnoughBalanceForFees"
  | "KeychainNotCompatibleWithMasp"
  | "CustomAddressNotMatchingChain"
  | "NoLedgerConnected"
  | "Ok";

// Check if the provided address is valid for the destination chain and transaction type
const isValidDestinationAddress = ({
  customAddress,
  chain,
  shielded,
}: {
  customAddress: string;
  chain: Chain | undefined;
  shielded: boolean;
}): boolean => {
  // Skip validation if no custom address or chain provided
  if (!customAddress || !chain) return true;

  // Check shielded/transparent address requirements for Namada
  if (chain.bech32_prefix === "nam") {
    // If shielded is required but address is transparent, validation fails
    if (shielded && isTransparentAddress(customAddress)) return false;
    // If transparent is required but address is shielded, validation fails
    if (!shielded && isShieldedAddress(customAddress)) return false;
    // Valid Namada address that matches transaction type
    return (
      isTransparentAddress(customAddress) || isShieldedAddress(customAddress)
    );
  }

  // For non-Namada chains, validate using prefix
  return customAddress.startsWith(chain.bech32_prefix);
};

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
  currentStatus,
  currentStatusExplanation,
  completedAt,
  onComplete,
  buttonTextErrors = {},
  isShieldedTx = false,
}: TransferModuleProps): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const [walletSelectorModalOpen, setWalletSelectorModalOpen] = useState(false);
  const [sourceChainModalOpen, setSourceChainModalOpen] = useState(false);
  const [destinationChainModalOpen, setDestinationChainModalOpen] =
    useState(false);
  const [assetSelectorModalOpen, setAssetSelectorModalOpen] = useState(false);
  const [customAddressActive, setCustomAddressActive] = useState(
    destination.enableCustomAddress && !destination.availableWallets
  );
  const [memo, setMemo] = useState<undefined | string>();
  const keychainVersion = useKeychainVersion();
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);
  const allUsersAssets = Object.values(chainAssetsMap) ?? [];
  const gasConfig = gasConfigProp ?? feeProps?.gasConfig;

  const displayGasFee = useMemo(() => {
    return gasConfig ? getDisplayGasFee(gasConfig, chainAssetsMap) : undefined;
  }, [gasConfig]);

  const availableAssets: AddressWithAssetAndAmountMap = useMemo(() => {
    return filterAvailableAsssetsWithBalance(source.availableAssets);
  }, [source.availableAssets]);

  const selectedAsset = mapUndefined(
    (address) => source.availableAssets?.[address],
    source.selectedAssetAddress
  );

  const availableAmountMinusFees = useMemo(() => {
    const { selectedAssetAddress, availableAmount } = source;

    if (
      typeof selectedAssetAddress === "undefined" ||
      typeof availableAmount === "undefined" ||
      typeof availableAssets === "undefined"
    ) {
      return undefined;
    }

    if (
      !displayGasFee?.totalDisplayAmount ||
      // Don't subtract if the gas token is different than the selected asset:
      gasConfig?.gasToken !== selectedAssetAddress
    ) {
      return availableAmount;
    }

    const amountMinusFees = availableAmount
      .minus(displayGasFee.totalDisplayAmount)
      .decimalPlaces(6);

    return BigNumber.max(amountMinusFees, 0);
  }, [source.selectedAssetAddress, source.availableAmount, displayGasFee]);

  const validationResult = useMemo((): ValidationResult => {
    if (!source.wallet) {
      return "NoSourceWallet";
    } else if (
      !isValidDestinationAddress({
        customAddress: destination.customAddress ?? "",
        chain: destination.chain,
        shielded: isShieldedTx,
      })
    ) {
      return "CustomAddressNotMatchingChain";
    } else if (
      (source.isShieldedAddress || destination.isShieldedAddress) &&
      keychainVersion &&
      !checkKeychainCompatibleWithMasp(keychainVersion)
    ) {
      return "KeychainNotCompatibleWithMasp";
    } else if (!source.chain) {
      return "NoSourceChain";
    } else if (!destination.chain) {
      return "NoDestinationChain";
    } else if (!source.selectedAssetAddress) {
      return "NoSelectedAsset";
    } else if (!hasEnoughBalanceForFees()) {
      return "NotEnoughBalanceForFees";
    } else if (!source.amount || source.amount.eq(0)) {
      return "NoAmount";
    } else if (
      !availableAmountMinusFees ||
      source.amount.gt(availableAmountMinusFees)
    ) {
      return "NotEnoughBalance";
    } else if (!destination.wallet && !destination.customAddress) {
      return "NoDestinationWallet";
    } else if (
      (source.isShieldedAddress || destination.isShieldedAddress) &&
      source.ledgerAccountInfo &&
      !source.ledgerAccountInfo.deviceConnected
    ) {
      return "NoLedgerConnected";
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

  function hasEnoughBalanceForFees(): boolean {
    // Skip if transaction fees will be handled by another wallet, like Keplr.
    // (Ex: when users transfer from IBC to Namada)
    if (source.wallet && source.wallet !== wallets.namada) {
      return true;
    }

    if (!availableAssets || !gasConfig || !displayGasFee) {
      return false;
    }

    // Find how much the user has in their account for the selected fee token
    const feeTokenAddress = gasConfig.gasToken;

    if (!availableAssets.hasOwnProperty(feeTokenAddress)) {
      return false;
    }

    const assetDisplayAmount = availableAssets[feeTokenAddress].amount;
    const feeDisplayAmount = displayGasFee?.totalDisplayAmount;

    return assetDisplayAmount.gt(feeDisplayAmount);
  }

  const chainAcceptedAssets = useMemo(() => {
    // Get available assets that are accepted by the chain
    return Object.values(availableAssets).filter(({ asset }) => {
      if (!source.chain) return true;
      return allUsersAssets.some(
        (chainAsset) =>
          chainAsset?.symbol.toLowerCase() === asset?.symbol.toLowerCase()
      );
    });
  }, [availableAssets, source.chain, allUsersAssets]);

  const sortedAssets = useMemo(() => {
    if (!chainAcceptedAssets.length) {
      return [];
    }

    // Sort filtered assets by amount
    return [...chainAcceptedAssets].sort(
      (
        asset1: AddressWithAssetAndAmount,
        asset2: AddressWithAssetAndAmount
      ) => {
        return asset1.amount.gt(asset2.amount) ? -1 : 1;
      }
    );
  }, [chainAcceptedAssets]);

  const getButtonTextError = (
    id: ValidationResult,
    defaultText: string
  ): string => {
    if (buttonTextErrors.hasOwnProperty(id) && buttonTextErrors[id]) {
      return buttonTextErrors[id];
    }

    return defaultText;
  };

  const getButtonText = (): string | JSX.Element => {
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

      case "CustomAddressNotMatchingChain":
        return getText("Custom address does not match chain");
      case "NotEnoughBalance":
        return getText("Not enough balance");
      case "NotEnoughBalanceForFees":
        return getText("Not enough balance to pay for transaction fees");
      case "KeychainNotCompatibleWithMasp":
        return getText("Keychain is not compatible with MASP");
      case "NoLedgerConnected":
        return getText("Connect your ledger and open the Namada App");
    }

    if (!availableAmountMinusFees) {
      return getText("Wallet amount not available");
    }

    return "Submit";
  };

  const buttonColor =
    destination.isShieldedAddress || source.isShieldedAddress ?
      "yellow"
    : "white";

  const renderLedgerTooltip = useCallback(
    () => (
      <IconTooltip
        className="absolute w-4 h-4 top-0 right-0 mt-4 mr-5"
        icon={<BsQuestionCircleFill className="w-4 h-4 text-yellow" />}
        text={
          <span>
            If your device is connected and the app is open, please go to{" "}
            <Link
              onClick={(e) => {
                e.preventDefault();
                navigate(routes.settingsLedger, {
                  state: { backgroundLocation: location },
                });
              }}
              to={routes.settingsLedger}
              className="text-yellow"
            >
              Settings
            </Link>{" "}
            and pair your device with Namadillo.
          </span>
        }
      />
    ),
    []
  );

  return (
    <>
      <section className="max-w-[480px] mx-auto" role="widget">
        <Stack
          className={clsx({
            "opacity-0 transition-all duration-300 pointer-events-none":
              completedAt,
          })}
          as="form"
          onSubmit={onSubmit}
        >
          <TransferSource
            isConnected={Boolean(source.connected)}
            wallet={source.wallet}
            walletAddress={source.walletAddress}
            asset={selectedAsset?.asset}
            isLoadingAssets={source.isLoadingAssets}
            chain={parseChainInfo(source.chain, source.isShieldedAddress)}
            availableAmount={source.availableAmount}
            availableAmountMinusFees={availableAmountMinusFees}
            amount={source.amount}
            openProviderSelector={onChangeWallet(source)}
            openChainSelector={
              source.onChangeChain && !isSubmitting ?
                () => setSourceChainModalOpen(true)
              : undefined
            }
            openAssetSelector={
              source.onChangeSelectedAsset && !isSubmitting ?
                () => setAssetSelectorModalOpen(true)
              : undefined
            }
            onChangeAmount={source.onChangeAmount}
            isShieldedAddress={source.isShieldedAddress}
            onChangeShielded={source.onChangeShielded}
            isSubmitting={isSubmitting}
          />
          <i className="flex items-center justify-center w-11 mx-auto -my-8 relative z-10">
            <TransferArrow
              color={destination.isShieldedAddress ? "#FF0" : "#FFF"}
              isAnimating={isSubmitting}
            />
          </i>
          <TransferDestination
            wallet={destination.wallet}
            walletAddress={destination.walletAddress}
            chain={parseChainInfo(
              destination.chain,
              destination.isShieldedAddress
            )}
            isShieldedAddress={destination.isShieldedAddress}
            isShieldedTx={isShieldedTx}
            onChangeShielded={destination.onChangeShielded}
            address={destination.customAddress}
            onToggleCustomAddress={
              destination.enableCustomAddress && destination.availableWallets ?
                setCustomAddressActive
              : undefined
            }
            customAddressActive={customAddressActive}
            openProviderSelector={() =>
              destination.onChangeWallet && destination.wallet ?
                destination.onChangeWallet(destination.wallet)
              : undefined
            }
            openChainSelector={
              destination.onChangeChain && !isSubmitting ?
                () => setDestinationChainModalOpen(true)
              : undefined
            }
            onChangeAddress={destination.onChangeCustomAddress}
            memo={memo}
            onChangeMemo={setMemo}
            feeProps={feeProps}
            changeFeeEnabled={changeFeeEnabled}
            gasDisplayAmount={displayGasFee?.totalDisplayAmount}
            gasAsset={displayGasFee?.asset}
            destinationAsset={selectedAsset?.asset}
            amount={source.amount}
            isSubmitting={isSubmitting}
          />
          {isIbcTransfer && requiresIbcChannels && (
            <IbcChannels
              isShielded={Boolean(
                source.isShieldedAddress || destination.isShieldedAddress
              )}
              sourceChannel={ibcOptions.sourceChannel}
              onChangeSource={ibcOptions.onChangeSourceChannel}
              destinationChannel={ibcOptions.destinationChannel}
              onChangeDestination={ibcOptions.onChangeDestinationChannel}
            />
          )}
          {!isSubmitting && <InlineError errorMessage={errorMessage} />}
          {currentStatus && isSubmitting && (
            <CurrentStatus
              status={currentStatus}
              explanation={currentStatusExplanation}
            />
          )}
          {!isSubmitting && onSubmitTransfer && (
            <div className="relative">
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

              {validationResult === "NoLedgerConnected" &&
                renderLedgerTooltip()}
            </div>
          )}
          {validationResult === "KeychainNotCompatibleWithMasp" && (
            <div className="text-center text-fail text-xs selection:bg-fail selection:text-white mb-12">
              Please update your Namada Keychain in order to make shielded
              transfers
            </div>
          )}
        </Stack>
        {completedAt && selectedAsset?.asset && source.amount && (
          <SuccessAnimation
            asset={selectedAsset.asset}
            amount={source.amount}
            onCompleteAnimation={onComplete}
          />
        )}
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
            assets={sortedAssets}
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
