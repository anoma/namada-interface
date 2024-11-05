import { Heading, PieChart, SkeletonLoading } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { shieldedTokensAtom } from "atoms/balance/atoms";
import { getTotalDollar } from "atoms/balance/functions";
import { useAtomValue } from "jotai";
import { colors } from "theme";

export const ShieldedBalanceChart = (): JSX.Element => {
  const shieldedTokensQuery = useAtomValue(shieldedTokensAtom);

  const shieldedDollars = getTotalDollar(shieldedTokensQuery.data);

  return (
    <div className="flex items-center justify-center h-full w-full relative">
      <div className="h-[250px] w-[250px]">
        <AtomErrorBoundary
          result={shieldedTokensQuery}
          niceError="Unable to load balance"
        >
          {shieldedTokensQuery.isPending ?
            <SkeletonLoading
              height="100%"
              width="100%"
              className="rounded-full border-neutral-800 border-[24px] bg-transparent"
            />
          : <>
              <PieChart
                id="balance-chart"
                data={[{ value: 100, color: colors.shielded }]}
                strokeWidth={24}
                radius={125}
                segmentMargin={0}
              >
                <div className="flex flex-col gap-1 items-center leading-tight max-w-[180px]">
                  {!shieldedDollars ?
                    "N/A"
                  : <>
                      <Heading className="text-sm" level="h3">
                        Shielded Balance
                      </Heading>
                      <FiatCurrency
                        className="text-2xl sm:text-3xl whitespace-nowrap after:content-['*']"
                        amount={shieldedDollars}
                      />
                    </>
                  }
                </div>
              </PieChart>
              <div className="absolute -bottom-4 -left-2 text-[10px]">
                *Balances exclude NAM until phase 5
              </div>
            </>
          }
        </AtomErrorBoundary>
      </div>
    </div>
  );
};
