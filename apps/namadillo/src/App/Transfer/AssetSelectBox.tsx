import { Asset } from "types";

type AssetSelectBoxProps = {
  selectedAsset?: Asset;
  onChangeSelectedAsset?: (asset: Asset) => void;
};

export const AssetSelectBox = ({}: AssetSelectBoxProps): JSX.Element => {
  return <div></div>;
};
