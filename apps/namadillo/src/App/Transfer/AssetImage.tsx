import { Asset } from "@chain-registry/types";
import { getAssetImageUrl } from "integrations/utils";
import { namadaAsset } from "registry/namadaAsset";

type AssetImageProps = {
  asset?: Asset;
  isShielded?: boolean;
};

export const AssetImage = ({
  asset,
  isShielded,
}: AssetImageProps): JSX.Element => {
  const image = getAssetImageUrl(asset);
  return (
    <span className="relative w-full aspect-square select-none">
      {asset ?
        <img src={image} alt={asset.symbol + ` logo`} className="w-full" />
      : <img
          className="bg-neutral-800 rounded-full aspect-square w-full"
          alt="Logo not available"
          role="img"
        />
      }
      {isShielded !== undefined && (
        <span className="absolute -bottom-1 -right-1 w-4 aspect-square">
          <AssetImage asset={namadaAsset} />
        </span>
      )}
    </span>
  );
};
