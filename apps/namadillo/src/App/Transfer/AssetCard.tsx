import { Asset } from "@chain-registry/types";
import clsx from "clsx";

type AssetCardProps = {
  asset: Asset;
};

export const AssetCard = ({ asset }: AssetCardProps): JSX.Element => {
  const image = asset.logo_URIs?.svg || asset.logo_URIs?.png;
  return (
    <span
      className={clsx(
        "grid grid-cols-[40px_auto] gap-6 w-full px-4 py-2.5 items-center"
      )}
    >
      {image ?
        <img
          src={image}
          alt={asset.name + ` logo`}
          className="w-full aspect-square"
        />
      : <img
          className="bg-neutral-800 rounded-full aspect-square w-full"
          alt="Logo not available"
          role="img"
        />
      }
      <span className="text-left">{asset.name}</span>
    </span>
  );
};
