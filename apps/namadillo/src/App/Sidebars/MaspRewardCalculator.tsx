import { Panel, SkeletonLoading, StyledSelectBox } from "@namada/components";
import { AssetImage } from "App/Transfer/AssetImage";
import { maspRewardsAtom } from "atoms/chain";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { MaspAssetRewards } from "types";

export const MaspRewardCalculator = (): JSX.Element => {
  const rewards = useAtomValue(maspRewardsAtom);
  const [amount, setAmount] = useState<string>("");
  const [selectedAsset, setSelectedAsset] = useState<
    MaspAssetRewards | undefined
  >(rewards.data?.[0] || undefined);

  const estimatedRewards =
    amount ?
      (parseFloat(amount) * Number(selectedAsset?.maxRewardRate)).toFixed(2)
    : "0.00";

  return (
    <Panel className={clsx("flex flex-col pt-2 pb-2 px-2")}>
      <h2 className="uppercase text-[13px] text-center font-medium pb-0 pt-2">
        MASP REWARDS CALCULATOR
      </h2>
      <div className="mt-3 flex flex-col gap-3">
        {rewards.isLoading && (
          <div className="flex flex-col gap-1">
            <SkeletonLoading height="40px" width="100%" />
            <SkeletonLoading height="40px" width="100%" />
            <SkeletonLoading height="40px" width="100%" />
          </div>
        )}
        {rewards.data && (
          <>
            <StyledSelectBox
              value={selectedAsset?.asset.base || rewards.data[0].asset.base}
              id="validator-filter"
              containerProps={{
                className: clsx(
                  "text-sm flex-1 border-none bg-neutral-900 w-full rounded-sm",
                  "px-4"
                ),
              }}
              arrowContainerProps={{ className: "right-4" }}
              listContainerProps={{
                className:
                  "w-full mt-2 border border-neutral-700 bg-neutral-800 px-2 h-[200px] dark-scrollbar overflow-y-auto",
              }}
              listItemProps={{
                className:
                  "text-sm w-full border-0 py-0 pl-2 [&_label]:py-0.5 bg-neutral-800 hover:bg-neutral-700 rounded-sm",
              }}
              labelProps={{
                className: "group-hover/item:text-white",
              }}
              onChange={(e) => {
                const selectedBase = e.target.value;
                const selected = rewards.data.find(
                  (reward) => reward.asset.base === selectedBase
                );
                if (selected) {
                  setSelectedAsset(selected);
                }
              }}
              options={rewards.data.map((reward) => ({
                id: reward.asset.base,
                value: (
                  <div
                    className={clsx(
                      "grid grid-cols-[auto_1fr] gap-1",
                      "w-full min-h-[28px] mt-0.5 py-2"
                    )}
                  >
                    <div className="aspect-square w-8 h-8 -mt-0.5">
                      <AssetImage asset={reward.asset} />
                    </div>
                    <div className="text-sm ml-3 mt-1">
                      {reward.asset.symbol}
                    </div>
                  </div>
                ),
                ariaLabel: reward.asset.symbol,
              }))}
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length >= 8) return;
                setAmount(e.target.value);
              }}
              placeholder="Enter amount"
              className="w-full border border-none rounded-sm bg-neutral-900 text-white py-3 px-5 text-left focus:outline-none"
            />

            <div className="flex flex-col items-center justify-center border border-neutral-500 rounded-sm py-8">
              <div className="text-yellow text-3xl font-bold max-w-full px-4">
                {estimatedRewards}
              </div>
              <div className="text-sm text-yellow font-normal">NAM</div>
              <div className="text-neutral-400 text-xs mt-1 px-4 text-center">
                Est. shielded rewards per 24hrs
              </div>
            </div>
          </>
        )}
      </div>
    </Panel>
  );
};
