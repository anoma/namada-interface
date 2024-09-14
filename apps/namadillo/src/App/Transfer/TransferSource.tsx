import { ActionButton } from "@namada/components";
import { Asset, Chain } from "types";
import { AssetSelectBox } from "./AssetSelectBox";
import { ChainSelectBox } from "./ChainSelectBox";

type TransferSourceProps = {
  onConnectProvider: () => void;
  isConnected: boolean;
  selectedAsset?: Asset;
  onChangeSelectedAsset?: (asset: Asset) => void;
  sourceChain?: Chain;
  openChainSelector?: () => void;
};

export const TransferSource = ({
  sourceChain,
  openChainSelector,
  onConnectProvider,
}: TransferSourceProps): JSX.Element => {
  return (
    <div className="relative bg-neutral-800 rounded-lg px-4 py-5">
      <header className="relative">
        <ChainSelectBox onClick={openChainSelector} chain={sourceChain} />
        <ActionButton
          className="inline-flex absolute top-0 right-0 w-auto"
          onClick={onConnectProvider}
          size="xs"
          backgroundColor="white"
        >
          Connect Wallet
        </ActionButton>
      </header>
      <hr className="my-4 mx-2 border-white opacity-[5%]" />
      <div>
        <AssetSelectBox />
      </div>
      <footer></footer>
    </div>
  );
};
