import { ActionButton, AmountSummaryCard } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { routes } from "App/routes";
import { chainParametersAtom } from "atoms/chain/atoms";
import { applicationFeaturesAtom } from "atoms/settings";
import { claimableRewardsAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { GoStack } from "react-icons/go";
import { useLocation, useNavigate } from "react-router-dom";
import { sumBigNumberArray } from "utils";

export const StakingRewardsPanel = (): JSX.Element => {
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);
  const {
    data: rewards,
    isLoading: rewardsLoading,
    isSuccess: rewardsLoaded,
    isRefetching: rewardsRefetching,
  } = useAtomValue(claimableRewardsAtom);

  const chainParameters = useAtomValue(chainParametersAtom);
  const location = useLocation();
  const navigate = useNavigate();
  const availableRewards =
    claimRewardsEnabled ?
      sumBigNumberArray(Object.values(rewards || {}))
    : new BigNumber(0);

  const title =
    claimRewardsEnabled ?
      "Unclaimed Staking Rewards"
    : "Staking Rewards will be enabled in phase 2";

  return (
    <>
      <AmountSummaryCard
        className={clsx({
          "opacity-60 pointer-events-none select-none": !claimRewardsEnabled,
        })}
        isLoading={rewardsLoading || rewardsRefetching}
        isSuccess={rewardsLoaded}
        logoElement={
          <i className="text-4xl">
            <GoStack />
          </i>
        }
        title={title}
        mainAmount={
          <NamCurrency
            amount={availableRewards}
            className="block leading-none text-2xl"
            currencySymbolClassName="block mb-3 mt-0.5 text-sm"
            decimalPlaces={2}
          />
        }
        callToAction={
          <ActionButton
            className="md:-mt-15 px-8"
            size="xs"
            outlineColor="white"
            backgroundColor="white"
            backgroundHoverColor="transparent"
            textColor="black"
            textHoverColor="white"
            disabled={!claimRewardsEnabled || availableRewards.eq(0)}
            onClick={() =>
              navigate(routes.stakingClaimRewards, {
                state: { backgroundLocation: location },
              })
            }
          >
            Claim
          </ActionButton>
        }
      />
      <div className="hidden sm:block">
        <div className="text-md text-gray-500 -mt-10 -mb-1 text-center">
          {chainParameters?.data?.apr ?
            chainParameters.data.apr.multipliedBy(100).toFixed(2)
          : "--"}
          %
        </div>
        <div className="text-sm text-neutral-450 text-center">
          Est. Rewards Rate
        </div>
      </div>
    </>
  );
};
