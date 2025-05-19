import { Panel, SkeletonLoading, Stack } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { UnclaimedRewardsCard } from "App/Staking/UnclaimedRewardsCard";
import { shieldedBalanceAtom } from "atoms/balance";
import clsx from "clsx";
import { useBalances } from "hooks/useBalances";
import { useRequiresNewShieldedSync } from "hooks/useRequiresNewShieldedSync";
import { useAtomValue } from "jotai";

export const TotalStakeBanner = (): JSX.Element => {
  const { isFetching: isShieldSyncing } = useAtomValue(shieldedBalanceAtom);
  const requiresNewShieldedSync = useRequiresNewShieldedSync();
  const shouldWaitForShieldedSync = requiresNewShieldedSync && isShieldSyncing;
  const { bondedAmount, isLoading: bondedAmountIsLoading } = useBalances();

  return (
    <Panel className="py-4 min-w-full">
      <Stack
        direction="horizontal"
        className="min-w-full overflow-hidden items-center justify-between px-4"
      >
        <div className="text-white">
          <header className="text-sm mb-3 -mt-10">
            <div className="flex items-center text-cyan">Total Staked NAM</div>
          </header>
          {bondedAmountIsLoading && (
            <SkeletonLoading height="1em" width="200px" className="text-6xl" />
          )}
          {!bondedAmountIsLoading && (
            <div
              className={clsx(
                "flex items-center text-7xl leading-none text-cyan"
              )}
            >
              <NamCurrency amount={bondedAmount} decimalPlaces={2} />
              {/* <FiatCurrency amount={totalAmountInFiat} /> */}
            </div>
          )}
        </div>
        <aside className="hidden lg:flex gap-4 items-center flex-wrap">
          <UnclaimedRewardsCard />
        </aside>
      </Stack>
    </Panel>
  );
};
