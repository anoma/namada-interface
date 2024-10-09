import {
  Currency,
  Heading,
  PieChart,
  SkeletonLoading,
} from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import {
  shieldedBalanceAtom,
  totalShieldedBalanceAtom,
} from "atoms/masp/atoms";
import { useAtomValue } from "jotai";
import { colors } from "theme";

export const ShieldedBalanceChart = (): JSX.Element => {
  const shieldedBalanceQuery = useAtomValue(shieldedBalanceAtom);
  const totalShieldedBalanceQuery = useAtomValue(totalShieldedBalanceAtom);

  return (
    <AtomErrorBoundary
      result={shieldedBalanceQuery}
      niceError="Unable to load balance"
    >
      <div className="flex items-center justify-center w-full h-[260px]">
        {totalShieldedBalanceQuery.data ?
          <PieChart
            id="balance-chart"
            className="xl:max-w-[85%] mx-auto"
            data={[{ value: 100, color: colors.shielded }]}
            strokeWidth={7}
            segmentMargin={0}
          >
            <div className="flex flex-col gap-1 items-center leading-tight">
              <Heading className="text-sm" level="h3">
                Shielded Balance
              </Heading>
              <div className="text-2xl sm:text-3xl">
                <Currency
                  currency={{ symbol: "$" }}
                  amount={totalShieldedBalanceQuery.data}
                />
              </div>
            </div>
          </PieChart>
        : <SkeletonLoading
            height="80%"
            width="80%"
            className="rounded-full aspect-square mx-auto border-neutral-800 border-[14px] bg-transparent"
          />
        }
      </div>
    </AtomErrorBoundary>
  );
};
