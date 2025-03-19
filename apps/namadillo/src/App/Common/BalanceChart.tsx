import {
  Heading,
  PieChart,
  PieChartData,
  SkeletonLoading,
} from "@namada/components";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { colors } from "theme";
import { NamCurrency } from "./NamCurrency";
import { OpacitySlides } from "./OpacitySlides";

type BalanceChartProps = {
  bondedAmount: BigNumber;
  unbondedAmount: BigNumber;
  availableAmount: BigNumber;
  withdrawableAmount: BigNumber;
  totalAmount: BigNumber;
  isLoading: boolean;
};

export const BalanceChart = ({
  availableAmount,
  bondedAmount,
  unbondedAmount,
  withdrawableAmount,
  totalAmount,
  isLoading,
}: BalanceChartProps): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

  const getPiechartData = (): Array<PieChartData> => {
    if (isLoading) {
      return [];
    }

    if (totalAmount.eq(0)) {
      // Preserves the pie chart circle shape when there is no balance without showing an amount
      return [{ value: 0.0000000000001, color: colors.empty }];
    }

    return [
      {
        label: "Total Staked Balance",
        value: bondedAmount,
        color: colors.bond,
      },
      {
        label: "Available NAM to Stake",
        value: availableAmount,
        color: colors.balance,
      },
      {
        label: "Unbonding NAM",
        value: unbondedAmount.plus(withdrawableAmount),
        color: colors.unbond,
      },
    ];
  };

  const data = getPiechartData();

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
          data={data}
          strokeWidth={24}
          radius={125}
          segmentMargin={0}
          onMouseLeave={() => setActiveIndex(0)}
          onMouseEnter={(_data: PieChartData, index: number) =>
            setActiveIndex(index)
          }
        >
          <OpacitySlides activeIndex={activeIndex}>
            {data.map((item, index) => (
              <div
                key={item.label ?? index}
                className="flex flex-col gap-1 leading-tight"
              >
                <Heading className="text-sm text-neutral-500" level="h3">
                  {item.label}
                </Heading>
                <NamCurrency
                  amount={item.value}
                  className="text-2xl"
                  currencySymbolClassName="block mb-1 text-xs ml-1"
                  decimalPlaces={2}
                />
              </div>
            ))}
          </OpacitySlides>
        </PieChart>
      }
    </div>
  );
};
