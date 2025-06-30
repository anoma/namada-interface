import { Panel, SkeletonLoading } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { AssetImage } from "App/Transfer/AssetImage";
import { maspRewardsAtom } from "atoms/chain";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { Asset } from "types";

type MaspAssetRewardsItemProps = {
  asset: Asset;
  percentage: BigNumber;
};

const MaspAssetRewardsItem = ({
  asset,
  percentage,
}: MaspAssetRewardsItemProps): JSX.Element => {
  return (
    <div
      className={clsx(
        "bg-neutral-800 rounded-sm py-2 px-2.5 flex items-center justify-between text-yellow"
      )}
    >
      <span className="flex gap-4 items-center">
        <i className="w-6">
          <AssetImage asset={asset} />
        </i>
        {asset.symbol}
      </span>
      <span>{formatPercentage(percentage)}</span>
    </div>
  );
};

export const MaspAssetRewards = (): JSX.Element => {
  const rewards = useAtomValue(maspRewardsAtom);
  return (
    <Panel className={clsx("flex flex-col pt-2 pb-5 px-2")}>
      <h2 className="uppercase text-[13px] text-yellow text-center">
        MASP Asset Annual Inflation
      </h2>
      <div className="flex-1 mt-3">
        {rewards.isLoading && (
          <div className="flex flex-col gap-1">
            <SkeletonLoading height="40px" width="100%" />
            <SkeletonLoading height="40px" width="100%" />
            <SkeletonLoading height="40px" width="100%" />
          </div>
        )}
        <ul className="flex flex-col gap-1">
          {rewards.data &&
            rewards.data.map((reward, idx) => (
              <li key={reward.asset.base + "_" + idx}>
                <MaspAssetRewardsItem
                  asset={reward.asset}
                  percentage={reward.maxRewardRate}
                />
              </li>
            ))}
        </ul>
      </div>
    </Panel>
  );
};
