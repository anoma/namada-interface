import { Panel, SkeletonLoading, Stack } from "@namada/components";
import { NamCurrency } from "App/Common/NamCurrency";
import { UnclaimedRewardsCard } from "App/Staking/UnclaimedRewardsCard";
import clsx from "clsx";
import { useBalances } from "hooks/useBalances";

export const TotalStakeBanner = (): JSX.Element => {
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
            <SkeletonLoading height="1em" width="200px" className="text-5xl" />
          )}
          {!bondedAmountIsLoading && (
            <div className={clsx("flex items-center text-5xl leading-none")}>
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
