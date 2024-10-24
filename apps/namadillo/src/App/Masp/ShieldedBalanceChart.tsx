import { Heading, PieChart, SkeletonLoading } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { FiatCurrency } from "App/Common/FiatCurrency";
import { shieldedDollarsAmountAtom } from "atoms/masp/atoms";
import { useAtomValue } from "jotai";
import { colors } from "theme";

export const ShieldedBalanceChart = (): JSX.Element => {
  const shieldedDollarsAmountQuery = useAtomValue(shieldedDollarsAmountAtom);

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="h-[250px] w-[250px]">
        <AtomErrorBoundary
          result={shieldedDollarsAmountQuery}
          niceError="Unable to load balance"
        >
          {shieldedDollarsAmountQuery.isLoading ?
            <SkeletonLoading
              height="100%"
              width="100%"
              className="rounded-full border-neutral-800 border-[24px] bg-transparent"
            />
          : <PieChart
              id="balance-chart"
              data={[{ value: 100, color: colors.shielded }]}
              strokeWidth={24}
              radius={125}
              segmentMargin={0}
            >
              <div className="flex flex-col gap-1 items-center leading-tight max-w-[180px]">
                {!shieldedDollarsAmountQuery.data ?
                  <div>Dollar amount is not available</div>
                : <>
                    <Heading className="text-sm" level="h3">
                      Shielded Balance
                    </Heading>
                    <FiatCurrency
                      className="text-2xl sm:text-3xl"
                      amount={shieldedDollarsAmountQuery.data}
                    />
                  </>
                }
              </div>
            </PieChart>
          }
        </AtomErrorBoundary>
      </div>
    </div>
  );
};
