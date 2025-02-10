import { Asset, Chain } from "@chain-registry/types";
import { AmountInput } from "@namada/components";
import { TabSelector } from "App/Common/TabSelector";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { WalletProvider } from "types";
import { AvailableAmountFooter } from "./AvailableAmountFooter";
import { ConnectProviderButton } from "./ConnectProviderButton";
import { SelectedAsset } from "./SelectedAsset";
import { SelectedChain } from "./SelectedChain";
import { SelectedWallet } from "./SelectedWallet";
import { TokenAmountCard } from "./TokenAmountCard";

export type TransferSourceProps = {
  isConnected: boolean;
  wallet?: WalletProvider;
  walletAddress?: string;
  asset?: Asset;
  isLoadingAssets?: boolean;
  isSubmitting?: boolean;
  chain?: Chain;
  openChainSelector?: () => void;
  openAssetSelector?: () => void;
  openProviderSelector?: () => void;
  amount?: BigNumber;
  availableAmount?: BigNumber;
  availableAmountMinusFees?: BigNumber;
  onChangeAmount?: (amount: BigNumber | undefined) => void;
  isShielded?: boolean;
  onChangeShielded?: (isShielded: boolean) => void;
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
  chain,
  asset,
  isLoadingAssets,
  wallet,
  walletAddress,
  openProviderSelector,
  openChainSelector,
  openAssetSelector,
  availableAmount,
  availableAmountMinusFees,
  amount,
  onChangeAmount,
  isShielded,
  onChangeShielded,
  isSubmitting,
}: TransferSourceProps): JSX.Element => {
  return (
    <div className="relative bg-neutral-800 rounded-lg px-4 py-5">
      {/** Intro header - Ex: "IBC To Namada" */}
      {onChangeShielded && chain?.chain_name === "namada" && !isSubmitting && (
        <nav className="mb-6">
          <TabSelector
            active={isShielded ? "shielded" : "transparent"}
            items={[
              { id: "shielded", text: "Shielded", className: "text-yellow" },
              {
                id: "transparent",
                text: "Transparent",
                className: "text-white",
              },
            ]}
            onChange={() => onChangeShielded(!isShielded)}
          />
        </nav>
      )}

      {/** Chain selector / chain indicator */}
      <header className="relative flex justify-between">
        <SelectedChain
          onClick={openChainSelector}
          chain={chain}
          wallet={wallet}
        />
        {!walletAddress && (
          <ConnectProviderButton onClick={openProviderSelector} />
        )}
        {walletAddress && wallet && (
          <SelectedWallet
            wallet={wallet}
            address={walletAddress}
            onClick={openProviderSelector}
          />
        )}
      </header>
      <hr className="mt-4 mb-2.5 mx-2 border-white opacity-[5%]" />

      {/** Asset selector */}
      {!isSubmitting && (
        <div className="grid grid-cols-[max-content_auto] gap-5 mb-3">
          <SelectedAsset
            asset={asset}
            isLoading={isLoadingAssets}
            isDisabled={!chain || !walletAddress}
            onClick={openAssetSelector}
          />
          <AmountInput
            className={clsx(
              "text-right [&_input]:text-right [&_input]:text-3xl [&_input]:bg-transparent",
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
