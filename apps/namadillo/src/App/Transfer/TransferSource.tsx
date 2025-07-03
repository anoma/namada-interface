import { Asset, Chain } from "@chain-registry/types";
import { AmountInput } from "@namada/components";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { Address } from "types";
import { AddressDropdown } from "./AddressDropdown";
import { AvailableAmountFooter } from "./AvailableAmountFooter";
import { SelectedAsset } from "./SelectedAsset";
import { TokenAmountCard } from "./TokenAmountCard";

export type TransferSourceProps = {
  isLoadingAssets?: boolean;
  isSubmitting?: boolean;
  chain?: Chain;
  asset?: Asset;
  originalAddress?: Address;
  sourceAddress?: string;
  availableAmount?: BigNumber;
  availableAmountMinusFees?: BigNumber;
  amount?: BigNumber;
  openAssetSelector?: () => void;
  openProviderSelector?: () => void;
  onChangeAmount?: (amount: BigNumber | undefined) => void;
  onChangeWalletAddress?: (address: string) => void;
};

const amountMaxDecimalPlaces = (asset?: Asset): number | undefined => {
  if (typeof asset !== "undefined") {
    for (const { denom, exponent } of asset.denom_units) {
      if (denom === asset.display) {
        return exponent;
      }
    }
  }
  return undefined;
};

export const TransferSource = ({
  isLoadingAssets,
  isSubmitting,
  chain,
  asset,
  originalAddress,
  availableAmount,
  availableAmountMinusFees,
  amount,
  sourceAddress,
  openAssetSelector,
  openProviderSelector,
  onChangeAmount,
  onChangeWalletAddress,
}: TransferSourceProps): JSX.Element => {
  return (
    <div className="relative bg-neutral-800 rounded-lg px-4 py-5">
      {/** Chain selector / chain indicator */}
      <header className="relative flex justify-between">
        <SelectedAsset
          asset={asset}
          isLoading={isLoadingAssets}
          isDisabled={!chain || !sourceAddress}
          onClick={openAssetSelector}
        />
        {sourceAddress && (
          <AddressDropdown
            selectedAddress={sourceAddress}
            onClick={openProviderSelector}
            onSelectAddress={onChangeWalletAddress}
          />
        )}
      </header>

      {/** Asset selector */}
      {!isSubmitting && (
        <div className="grid grid-cols-[max-content_auto] gap-5 mb-3 p-5">
          <AmountInput
            className={clsx(
              "text-center [&_input]:text-center [&_input]:text-3xl [&_input]:bg-transparent",
              "[&_input]:!border-0 [&_input]:px-0"
            )}
            disabled={!chain || !asset}
            value={amount}
            onChange={(e) => onChangeAmount?.(e.target.value)}
            placeholder="Amount"
            maxDecimalPlaces={amountMaxDecimalPlaces(asset)}
          />
        </div>
      )}

      {/** Available amount footer */}
      {!isSubmitting && asset && availableAmountMinusFees && (
        <footer>
          <AvailableAmountFooter
            availableAmount={availableAmount}
            availableAmountMinusFees={availableAmountMinusFees}
            asset={asset}
            originalAddress={originalAddress}
            onClickMax={() =>
              onChangeAmount && onChangeAmount(availableAmountMinusFees)
            }
          />
        </footer>
      )}

      {isSubmitting && asset && amount && (
        <div className="pt-1.5 pb-3">
          <TokenAmountCard asset={asset} displayAmount={amount} />
        </div>
      )}
    </div>
  );
};
