import { getAssetImageUrl } from "integrations/utils";
import { Asset } from "types";
import { namadaAsset } from "utils";

type AssetImageProps = {
  asset?: Asset;
  isShielded?: boolean;
};

export const AssetImage = ({
  asset,
  isShielded,
}: AssetImageProps): JSX.Element => {
  const image = getAssetImageUrl(asset);
  const hasImage = asset?.logo_URIs?.svg || asset?.logo_URIs?.png;
  const assetName = asset?.name || "";
  const altText = hasImage ? `${assetName} logo` : `Logo not available`;

  return (
    <span className="relative w-full aspect-square select-none">
      <img src={image} alt={altText} className="w-full" />
      {isShielded !== undefined && (
        <span className="absolute -bottom-1 -right-1 w-4 aspect-square">
          <AssetImage asset={namadaAsset()} />
        </span>
      )}
    </span>
  );
};
