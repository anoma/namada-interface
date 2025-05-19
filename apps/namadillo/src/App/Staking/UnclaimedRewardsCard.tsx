import { ActionButton } from "@namada/components";
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
  const {
    data: rewards,
    isLoading: rewardsLoading,
    isSuccess: rewardsLoaded,
    isRefetching: rewardsRefetching,
  } = useAtomValue(claimableRewardsAtom);
  const availableRewards =
    claimRewardsEnabled ?
      sumBigNumberArray(Object.values(rewards || {}))
    : new BigNumber(0);
  return (
    <div
      className={clsx(
        "flex text-sm text-cyan bg-neutral-900 rounded-sm px-6 w-[50ch] justify-between",
        "py-6"
      )}
    >
      <div className="flex flex-col">
        <span className="text-center leading-tight mb-3">
          Unclaimed Staking Rewards
        </span>{" "}
        <NamCurrency
          amount={availableRewards}
          className="text-3xl text-center"
          decimalPlaces={2}
        />
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
        className="w-auto mt-10"
        size="xs"
        backgroundColor="cyan"
        textColor="black"
        href={routes.stakingBondingIncrement}
      >
        Stake NAM
      </ActionButton>
    </div>
  );
};
