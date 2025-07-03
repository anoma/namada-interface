import { ActionButton, Stack } from "@namada/components";
import { mapUndefined } from "@namada/utils";
import { IconTooltip } from "App/Common/IconTooltip";
import { InlineError } from "App/Common/InlineError";
import { routes } from "App/routes";
import { allDefaultAccountsAtom } from "atoms/accounts";
import { chainAssetsMapAtom } from "atoms/chain";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useKeychainVersion } from "hooks/useKeychainVersion";
import { useAtomValue } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { BsQuestionCircleFill } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AddressWithAssetAndAmountMap } from "types";
import { filterAvailableAssetsWithBalance } from "utils/assets";
import { getDisplayGasFee } from "utils/gas";
import { isTransparentAddress, parseChainInfo } from "./common";
import { CurrentStatus } from "./CurrentStatus";
import { IbcChannels } from "./IbcChannels";
import { SelectToken } from "./SelectToken";
import { SelectWalletModal } from "./SelectWalletModal";
import { SuccessAnimation } from "./SuccessAnimation";
import { TransferArrow } from "./TransferArrow";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";
import {
  OnSubmitTransferParams,
  TransferModuleProps,
  ValidationResult,
} from "./types";
import { getButtonText, validateTransferForm } from "./utils";

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
  const keychainVersion = useKeychainVersion();
  const chainAssetsMap = useAtomValue(chainAssetsMapAtom);
  const gasConfig = gasConfigProp ?? feeProps?.gasConfig;
  const displayGasFee = useMemo(() => {
    return gasConfig ? getDisplayGasFee(gasConfig, chainAssetsMap) : undefined;
  }, [gasConfig]);

  const { data: accounts } = useAtomValue(allDefaultAccountsAtom);
  const transparentAddress = accounts?.find((acc) =>
    isTransparentAddress(acc.address)
  )?.address;
  const [walletSelectorModalOpen, setWalletSelectorModalOpen] = useState(false);
  const [assetSelectorModalOpen, setAssetSelectorModalOpen] = useState(false);
  const [sourceAddress, setSourceAddress] = useState<string | undefined>(
    transparentAddress
  );
  const [memo, setMemo] = useState<undefined | string>();

  const availableAssets: AddressWithAssetAndAmountMap = useMemo(() => {
    return filterAvailableAssetsWithBalance(source.availableAssets);
  }, [source.availableAssets]);
  const firstAvailableAsset = Object.values(availableAssets)[0];
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
    return validateTransferForm({
      source,
      destination,
      gasConfig,
      availableAmountMinusFees,
      keychainVersion,
      availableAssets,
      displayGasFeeAmount: displayGasFee?.totalDisplayAmount,
    });
  }, [
    source,
    destination,
    gasConfig,
    availableAmountMinusFees,
    keychainVersion,
    availableAssets,
    displayGasFee,
  ]);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    const address = destination.customAddress || destination.walletAddress;
    if (!source.amount) throw new Error("Amount is not valid");
    if (!address) throw new Error("Address is not provided");
    if (!source.selectedAssetAddress) throw new Error("Asset is not selected");

    const params: OnSubmitTransferParams = {
      displayAmount: source.amount,
      destinationAddress: address.trim(),
      memo,
    };

    onSubmitTransfer?.(params);
  };

  const getButtonTextFromValidation = (): string =>
    getButtonText({
      isSubmitting,
      submittingText,
      validationResult,
      availableAmountMinusFees,
      buttonTextErrors,
    });

  useEffect(() => {
    if (!selectedAsset?.asset && firstAvailableAsset) {
      source.onChangeSelectedAsset?.(firstAvailableAsset?.originalAddress);
    }
  }, [firstAvailableAsset]);

  const buttonColor =
    destination.isShieldedAddress || source.isShieldedAddress ?
      "yellow"
    : "white";

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
            sourceAddress={sourceAddress}
            asset={selectedAsset?.asset}
            originalAddress={selectedAsset?.originalAddress}
            isLoadingAssets={source.isLoadingAssets}
            chain={parseChainInfo(source.chain, source.isShieldedAddress)}
            availableAmount={source.availableAmount}
            availableAmountMinusFees={availableAmountMinusFees}
            amount={source.amount}
            openAssetSelector={
              source.onChangeSelectedAsset && !isSubmitting ?
                () => setAssetSelectorModalOpen(true)
              : undefined
            }
            onChangeAmount={source.onChangeAmount}
            onChangeWalletAddress={setSourceAddress}
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
            address={destination.customAddress}
            openProviderSelector={() =>
              destination.onChangeWallet && destination.wallet ?
                destination.onChangeWallet(destination.wallet)
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
                {getButtonTextFromValidation()}
              </ActionButton>

              {validationResult === "NoLedgerConnected" && (
                <IconTooltip
                  className="absolute w-4 h-4 top-0 right-0 mt-4 mr-5"
                  icon={
                    <BsQuestionCircleFill className="w-4 h-4 text-yellow" />
                  }
                  text={
                    <span>
                      If your device is connected and the app is open, please go
                      to{" "}
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
              )}
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

      <SelectToken
        isOpen={assetSelectorModalOpen}
        onClose={() => setAssetSelectorModalOpen(false)}
        onSelect={(asset) => {
          source.onChangeAmount?.(undefined);
          source.onChangeSelectedAsset?.(asset);
          setAssetSelectorModalOpen(false);
        }}
      />

      {walletSelectorModalOpen &&
        source.onChangeWallet &&
        source.availableWallets && (
          <SelectWalletModal
            availableWallets={source.availableWallets}
            onClose={() => setWalletSelectorModalOpen(false)}
            onConnect={source.onChangeWallet}
          />
        )}
    </>
  );
};
