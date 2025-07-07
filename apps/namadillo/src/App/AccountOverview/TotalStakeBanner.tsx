import { Panel, SkeletonLoading, Stack } from "@namada/components";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { NamCurrency } from "App/Common/NamCurrency";
import { UnclaimedRewardsCard } from "App/Staking/UnclaimedRewardsCard";
import { tokenPricesFamily } from "atoms/prices/atoms";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useBalances } from "hooks/useBalances";
import { useAtomValue } from "jotai";
import { namadaAsset } from "utils";

export const TotalStakeBanner = (): JSX.Element => {
  const { bondedAmount, isLoading: bondedAmountIsLoading } = useBalances();
  const nativeAsset = namadaAsset();
  const tokenPrices = useAtomValue(tokenPricesFamily([nativeAsset.address!]));
  const namPrice = tokenPrices.data?.[nativeAsset.address!] ?? BigNumber(0);

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
            <>
              <div className={clsx("flex items-center text-5xl leading-none")}>
                <NamCurrency amount={bondedAmount} decimalPlaces={2} />
              </div>
              {Number(namPrice) > 0 && (
                <div
                  className={clsx(
                    "flex items-center text-2xl leading-none mt-8"
                  )}
                >
                  <FiatCurrency amount={bondedAmount.times(namPrice)} />
                </div>
              )}
            </>
          )}
        </div>
        <aside className="-mr-6 flex-wrap mt-4 md:mt-0">
          <UnclaimedRewardsCard />
        </aside>
      </Stack>
    </Panel>
  );
};
