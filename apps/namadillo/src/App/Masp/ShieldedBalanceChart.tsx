import { Heading, PieChart, SkeletonLoading } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { shieldedBalanceAtom, shieldedTokensAtom } from "atoms/balance/atoms";
import { getTotalDollar } from "atoms/balance/functions";
import { applicationFeaturesAtom } from "atoms/settings";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { twMerge } from "tailwind-merge";
import { colors } from "theme";

export const ShieldedBalanceChart = (): JSX.Element => {
  const { isFetching: isShieldSyncing } = useAtomValue(shieldedBalanceAtom);
  const { namTransfersEnabled } = useAtomValue(applicationFeaturesAtom);
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);

  const shieldedDollars = getTotalDollar(shieldedTokensQuery.data);

  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <div className="h-[250px] w-[250px]">
        <AtomErrorBoundary
          result={shieldedTokensQuery}
          niceError="Unable to load balance"
        >
          <PieChart
            id="balance-chart"
            data={[
              {
                value: 100,
                color:
                  shieldedTokensQuery.isSuccess ?
                    colors.shielded
                  : colors.empty,
              },
            ]}
            strokeWidth={24}
            radius={125}
            segmentMargin={0}
            className={clsx({ "animate-pulse": shieldedTokensQuery.isPending })}
          >
            <div className="flex flex-col gap-1 items-center leading-tight max-w-[180px]">
              {shieldedTokensQuery.isPending && (
                <SkeletonLoading width="80px" height="40px" />
              )}
              {shieldedTokensQuery.isSuccess && (
                <>
                  <Heading className="text-sm" level="h3">
                    Shielded Value
                  </Heading>
                  <FiatCurrency
                    className={twMerge(
                      "text-2xl sm:text-3xl whitespace-nowrap",
                      !namTransfersEnabled && "after:content-['*']",
                      isShieldSyncing && "animate-pulse"
                    )}
                    amount={shieldedDollars ?? new BigNumber(0)}
                  />
                </>
              )}
            </div>
          </PieChart>
          {!namTransfersEnabled && (
            <div className="absolute -bottom-4 -left-2 text-[10px]">
              * Balances exclude NAM until phase 5
            </div>
          )}
        </AtomErrorBoundary>
      </div>
    </div>
  );
};
