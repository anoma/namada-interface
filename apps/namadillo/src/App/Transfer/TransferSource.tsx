import { AmountInput, ChangeAmountEvent } from "@namada/components";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { Asset, Chain, Provider } from "types";
import { AvailableAmountFooter } from "./AvailableAmountFooter";
import { ConnectProviderButton } from "./ConnectProviderButton";
import { SelectedAsset } from "./SelectedAsset";
import { SelectedChain } from "./SelectedChain";

export type TransferSourceProps = {
  isConnected: boolean;
  provider?: Provider;
  asset?: Asset;
  chain?: Chain;
  openChainSelector?: () => void;
  openAssetSelector?: () => void;
  openProviderSelector?: () => void;
  amount?: BigNumber;
  onChangeAmount?: ChangeAmountEvent;
};

export const TransferSource = ({
  chain,
  asset,
  provider,
  openProviderSelector,
  openChainSelector,
  openAssetSelector,
  amount,
  onChangeAmount,
}: TransferSourceProps): JSX.Element => {
  return (
    <div className="relative bg-neutral-800 rounded-lg px-4 py-5">
      <header className="relative">
        <SelectedChain
          onClick={openChainSelector}
          chain={chain}
          provider={provider}
        />
        {!provider && <ConnectProviderButton onClick={openProviderSelector} />}
      </header>
      <hr className="mt-4 mb-5 mx-2 border-white opacity-[5%]" />
      <div className="grid grid-cols-[max-content_auto] gap-5 mb-3">
        <SelectedAsset
          chain={chain}
          asset={asset}
          onClick={openAssetSelector}
        />
        <AmountInput
          className={clsx(
            "text-right [&_input]:text-right [&_input]:text-3xl [&_input]:bg-transparent",
            "[&_input]:!border-0 [&_input]:px-0"
          )}
          disabled={!chain || !asset}
          value={amount || new BigNumber(0)}
          onChange={onChangeAmount}
        />
      </div>
      <footer>
        <AvailableAmountFooter currency="nam" />
      </footer>
    </div>
  );
};
