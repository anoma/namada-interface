import {
  Heading,
  PieChart,
  PieChartData,
  SkeletonLoading,
} from "@namada/components";
import BigNumber from "bignumber.js";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { colors } from "theme";
import { NamCurrency } from "./NamCurrency";

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
  const [activeItem, setActiveItem] = useState<PieChartData | undefined>();

  const getPiechartData = (): Array<PieChartData> => {
    if (isLoading) {
      return [];
    }

    if (totalAmount.eq(0)) {
      return [{ value: 1, color: colors.empty }];
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
  const itemToRender = activeItem ?? data[0];

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
          onMouseLeave={() => setActiveItem(undefined)}
          onMouseEnter={(item: PieChartData) => setActiveItem(item)}
        >
          <AnimatePresence>
            {itemToRender?.label && (
              <motion.div
                key={itemToRender.label}
                exit={{ opacity: 0 }}
                className="absolute"
              >
                <div className="flex flex-col gap-1 leading-tight">
                  <Heading className="text-sm text-neutral-500" level="h3">
                    {itemToRender.label}
                  </Heading>
                  <NamCurrency
                    amount={itemToRender.value}
                    className="text-2xl"
                    currencySymbolClassName="block mb-1 text-xs ml-1"
                    decimalPlaces={2}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </PieChart>
      }
    </div>
  );
};
