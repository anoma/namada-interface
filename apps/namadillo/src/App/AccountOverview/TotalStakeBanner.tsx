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
        className="min-w-full overflow-hidden flex-col md:flex-row justify-between px-4"
      >
        <div className="text-cyan">
          <header className="text-sm">
            <div className="flex items-start mb-4">Total Staked NAM</div>
          </header>
          {bondedAmountIsLoading && (
            <SkeletonLoading height="1em" width="200px" className="text-6xl" />
          )}
          {!bondedAmountIsLoading && (
            <div className={clsx("flex items-center text-7xl leading-none")}>
              <NamCurrency amount={bondedAmount} decimalPlaces={2} />
              {/* <FiatCurrency amount={totalAmountInFiat} /> */}
            </div>
          )}
        </div>
        <aside className="-mr-6 flex-wrap mt-4 md:mt-0">
          <UnclaimedRewardsCard />
        </aside>
      </Stack>
    </Panel>
  );
};
