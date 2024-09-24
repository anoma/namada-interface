import {
  Heading,
  PieChart,
  PieChartData,
  SkeletonLoading,
} from "@namada/components";
import { AtomErrorBoundary } from "App/Common/AtomErrorBoundary";
import BigNumber from "bignumber.js";
import { useBalances } from "hooks/useBalances";
import { colors } from "theme";
import { NamCurrency } from "../Common/NamCurrency";

export const ShieldedBalanceChart = (): JSX.Element => {
  const view = Math.random() > 1 ? "stake" : "total";
  const {
    balanceQuery,
    stakeQuery,
    isLoading,
    isSuccess,
    availableAmount,
    bondedAmount,
    shieldedAmount,
    unbondedAmount,
    withdrawableAmount,
    totalAmount,
  } = useBalances();

  const getPiechartData = (): Array<PieChartData> => {
    if (isLoading) {
      return [];
    }

    if (totalAmount.eq(0)) {
      return [{ value: 1, color: colors.empty }];
    }

    return [
      { value: availableAmount, color: colors.balance },
      { value: shieldedAmount, color: colors.shielded },
      { value: bondedAmount, color: colors.bond },
      {
        value: unbondedAmount.plus(withdrawableAmount),
        color: colors.unbond,
      },
    ];
  };

  const renderTextSummary = (
    text: string,
    balance: BigNumber
  ): React.ReactNode => {
    return (
      <div className="flex flex-col gap-1 leading-tight">
        <Heading className="text-sm text-neutral-500" level="h3">
          {text}
        </Heading>
        <NamCurrency
          amount={balance}
          className="text-2xl"
          currencySignClassName="block mb-1 text-xs ml-1"
        />
      </div>
    );
  };

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
            data={getPiechartData()}
            strokeWidth={7}
            segmentMargin={0}
          >
            {view === "stake" &&
              renderTextSummary("Total Staked Balance", bondedAmount)}
            {view === "total" &&
              renderTextSummary("Total Balance", totalAmount)}
          </PieChart>
        )}
      </div>
    </AtomErrorBoundary>
  );
};
