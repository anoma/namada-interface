import { InactiveChannelWarning } from "App/Common/InactiveChannelWarning";
import { AssetImage } from "App/Transfer/AssetImage";
import { ReactNode } from "react";
import { Address, Asset } from "types";

export const TokenCard = ({
  address,
  asset,
  disabled,
}: {
  address: Address;
  asset: Asset;
  disabled?: ReactNode;
}): JSX.Element => {
  return (
    <div className="flex items-center gap-4" title={address}>
      <div className="aspect-square w-10 h-10">
        <AssetImage asset={asset} />
      </div>
      <div className="text-base leading-none">
        {asset.symbol}
        <InactiveChannelWarning address={address} />
        {disabled && (
          <div className="text-red-500 text-xs">disabled until phase 5</div>
        )}
      </div>
    </div>
  );
};
