import { Asset, Chain } from "types";
import { AssetSelectBox } from "./AssetSelectBox";
import { ChainSelectBox } from "./ChainSelectBox";

type TransferSourceProps = {
  onClickConnect: () => void;
  isConnected: boolean;
  selectedAsset?: Asset;
  onChangeSelectedAsset?: (asset: Asset) => void;
  sourceChain?: Chain;
  openChainSelector?: () => void;
};

export const TransferSource = ({
  sourceChain,
  openChainSelector,
}: TransferSourceProps): JSX.Element => {
  return (
    <div className="relative bg-neutral-800 rounded-lg px-4 py-5">
      <header>
        <ChainSelectBox onClick={openChainSelector} chain={sourceChain} />
      </header>
      <hr className="my-4 mx-2 border-white opacity-[5%]" />
      <div>
        <AssetSelectBox />
      </div>
      <footer></footer>
    </div>
  );
};
