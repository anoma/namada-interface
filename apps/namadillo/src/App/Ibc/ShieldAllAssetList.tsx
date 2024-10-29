import { Asset } from "@chain-registry/types";
import { Checkbox } from "@namada/components";
import { TokenCurrency } from "App/Common/TokenCurrency";
import { AssetWithBalance } from "atoms/integrations";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { getAssetImageUrl } from "integrations/utils";
import { toDisplayAmount } from "utils";

type AssetWithBalanceMap = Record<string, AssetWithBalance>;

type ShieldAllAssetListProps<T extends AssetWithBalanceMap> = {
  assets: T[keyof T][];
  checked: Record<keyof T, boolean>;
  onToggleAsset: (asset: Asset) => void;
};

export const ShieldAllAssetList = <T extends AssetWithBalanceMap>({
  assets,
  checked,
  onToggleAsset,
}: ShieldAllAssetListProps<T>): JSX.Element => {
  return (
    <ul className="max-h-[200px] dark-scrollbar -mr-2">
      {assets.map((assetWithBalance: AssetWithBalance, idx: number) => {
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
                checked={checked[assetWithBalance.asset.symbol]}
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
                asset={assetWithBalance.asset}
                amount={toDisplayAmount(
                  assetWithBalance.asset,
                  assetWithBalance.balance || new BigNumber(0)
                )}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
};
