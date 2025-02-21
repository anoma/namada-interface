import { Asset } from "@chain-registry/types";
import { shortenAddress } from "@namada/utils";
import clsx from "clsx";
import { AssetImage } from "./AssetImage";
import { isNamadaAddress } from "./common";

type AssetCardProps = {
  asset: Asset;
  disabled?: boolean;
};

export const AssetCard = ({ asset, disabled }: AssetCardProps): JSX.Element => {
  return (
    <span
      className={clsx(
        "grid grid-cols-[40px_auto] gap-6 w-full px-4 py-2.5 items-center"
      )}
    >
      <AssetImage asset={asset} />
      <span className="text-left">
        {isNamadaAddress(asset.name) ? shortenAddress(asset.name) : asset.name}
        {disabled && (
          <i className="text-red-500 ml-2">disabled until phase 5</i>
        )}
      </span>
    </span>
  );
};
