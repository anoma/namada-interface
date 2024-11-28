import {
  Heading,
  PieChart,
  PieChartData,
  SkeletonLoading,
} from "@namada/components";
import BigNumber from "bignumber.js";
import { colors } from "theme";
import { NamCurrency } from "./NamCurrency";

type BalanceChartProps = {
  view: "total" | "stake";
  bondedAmount: BigNumber;
  unbondedAmount: BigNumber;
  availableAmount: BigNumber;
  withdrawableAmount: BigNumber;
  totalAmount: BigNumber;
  isLoading: boolean;
};

export const BalanceChart = ({
  view,
  availableAmount,
  bondedAmount,
  unbondedAmount,
  withdrawableAmount,
  totalAmount,
  isLoading,
}: BalanceChartProps): JSX.Element => {
  const getPiechartData = (): Array<PieChartData> => {
    if (isLoading) {
      return [];
    }

    if (totalAmount.eq(0)) {
      return [{ value: 1, color: colors.empty }];
    }

    return [
      { value: availableAmount, color: colors.balance },
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
          currencySymbolClassName="block mb-1 text-xs ml-1"
          decimalPlaces={2}
        />
      </div>
    );
  };

  return (
    <div className="h-[250px] w-[250px]">
      {isLoading ?
        <SkeletonLoading
          height="100%"
          width="100%"
          className="rounded-full border-neutral-800 border-[24px] bg-transparent"
        />
      : <PieChart
          id="balance-chart"
          data={getPiechartData()}
          strokeWidth={24}
          radius={125}
          segmentMargin={0}
        >
          {view === "stake" &&
            renderTextSummary("Total Staked Balance", bondedAmount)}
          {view === "total" && renderTextSummary("Total Balance", totalAmount)}
        </PieChart>
      }
    </div>
  );
};
