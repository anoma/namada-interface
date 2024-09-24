import { Heading, PieChart, SkeletonLoading } from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import { useBalances } from "hooks/useBalances";
import { colors } from "theme";
import { NamCurrency } from "../Common/NamCurrency";

export const ShieldedBalanceChart = (): JSX.Element => {
  const { balanceQuery, stakeQuery, isLoading, isSuccess, shieldedAmount } =
    useBalances();

  return (
    <AtomErrorBoundary
      result={[balanceQuery, stakeQuery]}
      niceError="Unable to load balance"
    >
      <div className="flex-1 w-full h-full">
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
              <NamCurrency
                amount={shieldedAmount}
                className="text-2xl"
                currencySignClassName="block mb-1 text-xs ml-1"
              />
            </div>
          </PieChart>
        )}
      </div>
    </AtomErrorBoundary>
  );
};
