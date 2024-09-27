import { Heading, PieChart, SkeletonLoading } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { useBalances } from "hooks/useBalances";
import { colors } from "theme";

export const ShieldedBalanceChart = (): JSX.Element => {
  const { isLoading, isSuccess } = useBalances();

  return (
    <AtomErrorBoundary
      // TODO shieldedQuery
      result={[]}
      niceError="Unable to load balance"
    >
      <div className="flex w-full h-[260px]">
        {isLoading && (
          <SkeletonLoading
            height="auto"
            width="80%"
            className="rounded-full aspect-square mx-auto border-neutral-800 border-[22px] bg-transparent"
          />
        )}
        {isSuccess && (
          <PieChart
            id="balance-chart"
            className="xl:max-w-[85%] mx-auto"
            data={[{ value: 100, color: colors.shielded }]}
            strokeWidth={7}
            segmentMargin={0}
          >
            <div className="flex flex-col gap-1 leading-tight">
              <Heading className="text-sm" level="h3">
                Shielded Balance
              </Heading>
              <div className="text-2xl sm:text-3xl">$9999.99</div>
            </div>
          </PieChart>
        )}
      </div>
    </AtomErrorBoundary>
  );
};
