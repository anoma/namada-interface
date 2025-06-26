import { Checkbox } from "@namada/components";
import { TokenCurrency } from "App/Common/TokenCurrency";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { getAssetImageUrl } from "integrations/utils";
import { Asset, AssetWithAmount } from "types";

export type SelectableAddressWithAssetAndAmount = AssetWithAmount & {
  checked: boolean;
};

type ShieldAllAssetListProps = {
  assets: SelectableAddressWithAssetAndAmount[];
  onToggleAsset: (asset: Asset) => void;
};

export const ShieldAllAssetList = ({
  assets,
  onToggleAsset,
}: ShieldAllAssetListProps): JSX.Element => {
  return (
    <ul className="max-h-[200px] dark-scrollbar -mr-2">
      {assets.map(
        (
          assetWithBalance: SelectableAddressWithAssetAndAmount,
          idx: number
        ) => {
          const image = getAssetImageUrl(assetWithBalance.asset);
          return (
            <li
              key={idx}
              className={clsx(
                "flex items-center justify-between bg-black text-white",
                "text-sm rounded-sm px-2.5 py-1.5"
              )}
            >
              <span className="flex gap-4 items-center">
                <Checkbox
                  className="!border-yellow"
                  checked={assetWithBalance.checked}
                  onChange={() => onToggleAsset(assetWithBalance.asset)}
                />
                {image && (
                  <img
                    src={image}
                    alt={`${assetWithBalance.asset.name} logo image`}
                    className="w-6"
                  />
                )}
                {assetWithBalance.asset.symbol}
              </span>
              <span className="text-xs">
                <TokenCurrency
                  currencySymbolClassName="hidden"
                  symbol={assetWithBalance.asset.symbol}
                  amount={assetWithBalance.amount || new BigNumber(0)}
                />
              </span>
            </li>
          );
        }
      )}
    </ul>
  );
};
