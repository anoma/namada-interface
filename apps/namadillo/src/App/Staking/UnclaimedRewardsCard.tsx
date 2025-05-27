import { ActionButton, SkeletonLoading } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { routes } from "App/routes";
import { chainParametersAtom } from "atoms/chain";
import { applicationFeaturesAtom } from "atoms/settings";
import { claimableRewardsAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { sumBigNumberArray } from "utils";

export const UnclaimedRewardsCard = (): JSX.Element => {
  const chainParameters = useAtomValue(chainParametersAtom);
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);
  const { data: rewards, isLoading: rewardsLoading } =
    useAtomValue(claimableRewardsAtom);
  const availableRewards =
    claimRewardsEnabled ?
      sumBigNumberArray(Object.values(rewards || {}))
    : new BigNumber(0);
  return (
    <div
      className={clsx(
        "flex flex-col md:flex-row text-sm text-cyan bg-neutral-900 rounded-sm px-6 w-[48ch] justify-between",
        "py-4"
      )}
    >
      <div className="flex flex-col">
        <span className="text-center leading-tight mb-2">
          Unclaimed Staking Rewards
        </span>{" "}
        {rewardsLoading ?
          <SkeletonLoading height="1em" width="200px" className="text-3xl" />
        : <NamCurrency
            amount={availableRewards}
            className="text-3xl text-center"
            decimalPlaces={2}
          />
        }
        <div className="hidden sm:block">
          <div className="text-md text-gray-500 -mb-1 text-center">
            {chainParameters?.data?.apr ?
              chainParameters.data.apr.multipliedBy(100).toFixed(2)
            : "--"}
            %
          </div>
          <div className="text-sm text-center">Est. Rewards Rate</div>
        </div>
      </div>
      <ActionButton
        className="w-auto mt-4 md:mt-10 self-center md:self-auto"
        size="xs"
        backgroundColor="cyan"
        textColor="black"
        href={routes.stakingClaimRewards}
      >
        Claim NAM
      </ActionButton>
    </div>
  );
};
