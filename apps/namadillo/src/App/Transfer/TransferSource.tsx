import { ActionButton } from "@namada/components";
import { Asset, Chain } from "types";
import { SelectedAsset } from "./SelectedAsset";
import { SelectedChain } from "./SelectedChain";

type TransferSourceProps = {
  onConnectProvider: () => void;
  isConnected: boolean;
  selectedAsset?: Asset;
  sourceChain?: Chain;
  openChainSelector?: () => void;
  openAssetSelector?: () => void;
};

export const TransferSource = ({
  sourceChain,
  selectedAsset,
  openChainSelector,
  openAssetSelector,
  onConnectProvider,
}: TransferSourceProps): JSX.Element => {
  return (
    <div className="relative bg-neutral-800 rounded-lg px-4 py-5">
      <header className="relative">
        <SelectedChain onClick={openChainSelector} chain={sourceChain} />
        <ActionButton
          className="inline-flex absolute top-0 right-0 w-auto"
          onClick={onConnectProvider}
          size="xs"
          backgroundColor="white"
        >
          Connect Wallet
        </ActionButton>
      </header>
      <hr className="mt-4 mb-5 mx-2 border-white opacity-[5%]" />
      <div>
        <SelectedAsset
          chain={sourceChain}
          asset={selectedAsset}
          onClick={openAssetSelector}
        />
      </div>
      <footer></footer>
    </div>
  );
};
