import { ActionButton, AmountSummaryCard } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import StakingRoutes from "App/Staking/routes";
import { applicationFeaturesAtom } from "atoms/settings";
import { claimableRewardsAtom } from "atoms/staking";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useMemo } from "react";
import { GoStack } from "react-icons/go";
import { useLocation, useNavigate } from "react-router-dom";

export const StakingRewardsPanel = (): JSX.Element => {
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);
  const { data: rewards } = useAtomValue(claimableRewardsAtom);
  const location = useLocation();
  const navigate = useNavigate();

  const availableRewards = useMemo(() => {
    return BigNumber.sum(...Object.values(rewards || []));
  }, [rewards]);

  const title =
    claimRewardsEnabled ?
      "Unclaimed Staking Rewards"
    : "Staking Rewards will be enabled in phase 2";

  return (
    <AmountSummaryCard
      className={clsx({
        "opacity-60 pointer-events-none select-none": !claimRewardsEnabled,
      })}
      logoElement={
        <i className="text-4xl">
          <GoStack />
        </i>
      }
      title={title}
      mainAmount={
        <NamCurrency
          amount={availableRewards}
          className="block leading-none"
          currencySignClassName="block mb-3 mt-0.5 text-sm"
        />
      }
      callToAction={
        <ActionButton
          className="px-8"
          size="xs"
          backgroundColor="white"
          disabled={!claimRewardsEnabled || availableRewards.eq(0)}
          onClick={() =>
            navigate(StakingRoutes.claimRewards().url, {
              state: { backgroundLocation: location },
            })
          }
        >
          Claim
        </ActionButton>
      }
    />
  );
};
