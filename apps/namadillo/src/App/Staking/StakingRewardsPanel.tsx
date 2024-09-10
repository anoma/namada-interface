import { ActionButton, AmountSummaryCard } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { applicationFeaturesAtom } from "atoms/settings";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { GoStack } from "react-icons/go";

export const StakingRewardsPanel = (): JSX.Element => {
  const { claimRewardsEnabled } = useAtomValue(applicationFeaturesAtom);

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
          amount={0}
          className="block leading-none"
          currencySignClassName="block mb-3 mt-0.5 text-sm"
        />
      }
      callToAction={
        <ActionButton
          className="px-8"
          size="xs"
          backgroundColor="white"
          disabled={!claimRewardsEnabled}
        >
          Claim
        </ActionButton>
      }
    />
  );
};
