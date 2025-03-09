import { Asset } from "@chain-registry/types";
import { InactiveChannelWarning } from "App/Common/InactiveChannelWarning";
import { getAssetImageUrl } from "integrations/utils";
import { Address } from "types";

export const TokenLabel = ({
  address,
  asset,
}: {
  address: Address;
  asset: Asset;
}): JSX.Element => {
  const icon = getAssetImageUrl(asset);

  return (
    <div className="flex items-center gap-4" title={address}>
      <div className="aspect-square w-8 h-8">
        {icon ?
          <img src={icon} />
        : <div className="rounded-full h-full border border-white" />}
      </div>
      <div className="leading-none">
        {asset.symbol}
        <InactiveChannelWarning address={address} />
      </div>
    </div>
  );
};
