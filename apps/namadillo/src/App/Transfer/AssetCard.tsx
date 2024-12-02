import { Asset } from "@chain-registry/types";
import clsx from "clsx";
import { AssetImage } from "./AssetImage";

type AssetCardProps = {
  asset: Asset;
};

export const AssetCard = ({ asset }: AssetCardProps): JSX.Element => {
  return (
    <span
      className={clsx(
        "grid grid-cols-[40px_auto] gap-6 w-full px-4 py-2.5 items-center"
      )}
    >
      <AssetImage asset={asset} />
      <span className="text-left">{asset.name}</span>
    </span>
  );
};
