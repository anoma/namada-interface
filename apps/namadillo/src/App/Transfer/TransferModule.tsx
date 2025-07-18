import { ActionButton, Stack } from "@namada/components";
import { IconTooltip } from "App/Common/IconTooltip";
import { InlineError } from "App/Common/InlineError";
import { params, routes } from "App/routes";
import {
  namadaShieldedAssetsAtom,
  namadaTransparentAssetsAtom,
} from "atoms/balance";
import { namadaRegistryChainAssetsMapAtom } from "atoms/integrations";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { TransactionFeeProps } from "hooks";
import { useKeychainVersion } from "hooks/useKeychainVersion";
import { useUrlState } from "hooks/useUrlState";
import { useAtomValue } from "jotai";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { BsQuestionCircleFill } from "react-icons/bs";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AssetWithAmount,
  GasConfig,
  IbcChannels as IbcChannelsType,
  LedgerAccountInfo,
} from "types";
import { filterAvailableAssetsWithBalance } from "utils/assets";
import { getDisplayGasFee } from "utils/gas";
import { isIbcAddress, isShieldedAddress } from "./common";
import { CurrentStatus } from "./CurrentStatus";
import { IbcChannels } from "./IbcChannels";
import { SelectToken } from "./SelectToken";
import { SuccessAnimation } from "./SuccessAnimation";
import { TransferArrow } from "./TransferArrow";
import { TransferDestination } from "./TransferDestination";
import { TransferSource } from "./TransferSource";
import { OnSubmitTransferParams, ValidationResult } from "./types";
import { getButtonText, validateTransferForm } from "./utils";

type TransferModuleProps = {
  source: {
    address: string | undefined;
    availableAmount: BigNumber | undefined;
    amount: BigNumber | undefined;
    selectedAssetWithAmount: AssetWithAmount | undefined;
    onChangeSelectedAsset: (asset: AssetWithAmount | undefined) => void;
    onChangeAmount: (amount: BigNumber | undefined) => void;
    ledgerAccountInfo?: LedgerAccountInfo | undefined;
    onChangeAddress: Dispatch<SetStateAction<string>>;
  };
  destination: {
    address: string | undefined;
    customAddress?: string;
    isShieldedAddress: boolean;
    memo?: string;
    onChangeAddress?: Dispatch<SetStateAction<string>>;
    onChangeMemo?: (memo: string | undefined) => void;
  };
  requiresIbcChannels?: boolean;
  feeProps?: TransactionFeeProps;
  ibcOptions?: IbcChannelsType | undefined;
  ibcChannels?: {
    sourceChannel: string;
    destinationChannel: string;
    onChangeSourceChannel: (sourceChannel: string) => void;
    onChangeDestinationChannel: (destinationChannel: string) => void;
  };
  isSubmitting: boolean;
  errorMessage?: string;
  gasConfig?: GasConfig;
  currentStatus: string;
  currentStatusExplanation?: string;
  onSubmitTransfer: (params: OnSubmitTransferParams) => Promise<void>;
  completedAt?: Date;
  setCompletedAt?: (completedAt: Date | undefined) => void;
  onComplete: () => void;
};

export const TransferModule = ({
  source,
  destination,
  feeProps,
  isSubmitting,
  errorMessage,
  currentStatus,
  currentStatusExplanation,
  gasConfig: gasConfigProp,
  onSubmitTransfer,
  completedAt,
  setCompletedAt,
  onComplete,
  ibcOptions,
  ibcChannels,
  requiresIbcChannels,
}: TransferModuleProps): JSX.Element => {
  const [selectedAssetAddress, setSelectedAssetAddress] = useUrlState(
    params.asset
  );

  const { data: usersAssets, isLoading: isLoadingUsersAssets } = useAtomValue(
    isShieldedAddress(source.address ?? "") ?
      namadaShieldedAssetsAtom
    : namadaTransparentAssetsAtom
  );
  const selectedAsset =
    source.selectedAssetWithAmount ||
    Object.values(usersAssets ?? {}).find(
      (item) => item.asset?.address === selectedAssetAddress
    );
  const availableAmount = selectedAsset?.amount;
  const availableAssets = useMemo(() => {
    return filterAvailableAssetsWithBalance(usersAssets);
  }, [usersAssets]);
  const [txHash, setTxHash] = useState<string | undefined>();
  const [refundTarget, setRefundTarget] = useState<string>();
  const chainAssetsMap = useAtomValue(namadaRegistryChainAssetsMapAtom);
  const [assetSelectorModalOpen, setAssetSelectorModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const keychainVersion = useKeychainVersion();
  const isTargetShielded = isShieldedAddress(destination.address ?? "");
  const isSourceShielded = isShieldedAddress(source.address ?? "");
  const isShielding =
    isShieldedAddress(destination.address ?? "") &&
    !isShieldedAddress(source.address ?? "");
  const isUnshielding =
    isShieldedAddress(source.address ?? "") &&
    !isShieldedAddress(destination.address ?? "");
  const isShieldedTx = isShieldedAddress(source.address ?? "");
  const buttonColor = isTargetShielded || isSourceShielded ? "yellow" : "white";
  const ibcTransfer =
    isIbcAddress(destination.address ?? "") ||
    isIbcAddress(source.address ?? "");

  const getButtonTextFromValidation = (): string => {
    const buttonTextErrors =
      isShielding || isUnshielding ?
        {
          NoAmount:
            isShielding ? "Define an amount to shield"
            : isUnshielding ? "Define an amount to unshield"
            : "",
        }
      : {};

    return getButtonText({
      isSubmitting,
      validationResult,
      availableAmountMinusFees,
      buttonTextErrors,
    });
  };

  const gasConfig = gasConfigProp ?? feeProps?.gasConfig;
  const displayGasFee = useMemo(() => {
    return gasConfig ?
        getDisplayGasFee(gasConfig, chainAssetsMap.data ?? {})
      : undefined;
  }, [gasConfig]);

  const availableAmountMinusFees = useMemo(() => {
    if (!selectedAsset?.asset.address || !availableAmount || !availableAssets)
      return undefined;
    if (
      !displayGasFee?.totalDisplayAmount ||
      // Don't subtract if the gas token is different than the selected asset:
      gasConfig?.gasToken !== selectedAsset?.asset.address
    ) {
      return availableAmount;
    }

    const amountMinusFees = availableAmount
      .minus(displayGasFee.totalDisplayAmount)
      .decimalPlaces(6);

    return BigNumber.max(amountMinusFees, 0);
  }, [selectedAsset?.asset.address, availableAmount, displayGasFee]);

  const validationResult = useMemo((): ValidationResult => {
    return validateTransferForm({
      source: {
        walletAddress: source.address,
        isShieldedAddress: isShieldedAddress(source.address ?? ""),
        selectedAssetAddress: selectedAsset?.asset.address,
        amount: source.amount,
        ledgerAccountInfo: source.ledgerAccountInfo,
      },
      destination: {
        walletAddress: destination.address,
        isShieldedAddress: isShieldedAddress(destination.address ?? ""),
        chain: undefined,
      },
      gasConfig,
      availableAmountMinusFees,
      keychainVersion,
      availableAssets,
      displayGasFeeAmount: displayGasFee?.totalDisplayAmount,
    });
  }, [
    source.address,
    selectedAsset?.asset.address,
    source.amount,
    source.ledgerAccountInfo,
    gasConfig,
    availableAmountMinusFees,
    keychainVersion,
    availableAssets,
    displayGasFee,
  ]);

  const onSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    onSubmitTransfer({
      displayAmount: source.amount?.toString() ?? "",
      destinationAddress: destination.address,
      sourceAddress: source.address,
      memo: destination.memo,
    });
  };

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
            sourceAddress={source.address}
            asset={selectedAsset?.asset}
            originalAddress={selectedAsset?.asset?.address}
            isLoadingAssets={isLoadingUsersAssets}
            isShieldingTxn={isShielding}
            availableAmount={availableAmount}
            availableAmountMinusFees={availableAmountMinusFees}
            amount={source.amount}
            openAssetSelector={
              !isSubmitting ? () => setAssetSelectorModalOpen(true) : undefined
            }
            onChangeAmount={source.onChangeAmount}
            isSubmitting={isSubmitting}
          />
          <i className="flex items-center justify-center w-11 mx-auto -my-8 relative z-10">
            <TransferArrow
              color={
                isShieldedAddress(destination.address ?? "") ? "#FF0" : "#FFF"
              }
              isAnimating={isSubmitting}
            />
          </i>
          <TransferDestination
            setDestinationAddress={destination.onChangeAddress}
            isShieldedAddress={isShieldedAddress(destination.address ?? "")}
            isShieldedTx={isShieldedTx}
            customAddress={destination.customAddress}
            address={destination.address}
            sourceAddress={source.address}
            onChangeAddress={destination.onChangeAddress}
            memo={destination.memo}
            onChangeMemo={destination.onChangeMemo}
            feeProps={feeProps}
            gasDisplayAmount={displayGasFee?.totalDisplayAmount}
            gasAsset={displayGasFee?.asset}
            destinationAsset={selectedAsset?.asset}
            amount={source.amount}
            isSubmitting={isSubmitting}
          />
          {ibcTransfer && requiresIbcChannels && ibcChannels && (
            <IbcChannels
              isShielded={Boolean(
                isShieldedAddress(source.address ?? "") ||
                  isShieldedAddress(destination.address ?? "")
              )}
              sourceChannel={ibcChannels.sourceChannel}
              onChangeSource={ibcChannels.onChangeSourceChannel}
              destinationChannel={ibcChannels.destinationChannel}
              onChangeDestination={ibcChannels.onChangeDestinationChannel}
            />
          )}
          {!isSubmitting && <InlineError errorMessage={errorMessage} />}
          {currentStatus && isSubmitting && (
            <CurrentStatus
              status={currentStatus}
              explanation={currentStatusExplanation}
            />
          )}
          {!isSubmitting && (
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
        sourceAddress={source.address || ""}
        setSourceAddress={source.onChangeAddress}
        isOpen={assetSelectorModalOpen}
        onClose={() => setAssetSelectorModalOpen(false)}
        onSelect={(selectedAssetWithAmount) => {
          source.onChangeAmount(undefined);
          setSelectedAssetAddress(selectedAssetWithAmount.asset.address);
          source.onChangeSelectedAsset(selectedAssetWithAmount);
          setAssetSelectorModalOpen(false);
        }}
      />
    </>
  );
};
