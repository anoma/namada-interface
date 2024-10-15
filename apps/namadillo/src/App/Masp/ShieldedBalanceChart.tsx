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
  const { data } = useAtomValue(totalShieldedBalanceAtom);

  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="h-[250px] w-[250px]">
        <AtomErrorBoundary
          result={shieldedBalanceQuery}
          niceError="Unable to load balance"
        >
          {data !== undefined ?
            <PieChart
              id="balance-chart"
              data={[{ value: 100, color: colors.shielded }]}
              strokeWidth={24}
              radius={125}
              segmentMargin={0}
            >
              <div className="flex flex-col gap-1 items-center leading-tight">
                <Heading className="text-sm" level="h3">
                  Shielded Balance
                </Heading>
                <div className="text-2xl sm:text-3xl">
                  <Currency currency={{ symbol: "$" }} amount={data} />
                </div>
              </div>
            </PieChart>
          : <SkeletonLoading
              height="100%"
              width="100%"
              className="rounded-full border-neutral-800 border-[24px] bg-transparent"
            />
          }
        </AtomErrorBoundary>
      </div>
    </div>
  );
};
