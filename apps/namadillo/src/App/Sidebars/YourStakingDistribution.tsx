import { PieChart, PieChartData } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { AnimatePresence } from "framer-motion";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { MyValidator } from "types";

type YourStakingDistributionProps = {
  myValidators: MyValidator[];
};

export const YourStakingDistribution = ({
  myValidators,
}: YourStakingDistributionProps): JSX.Element => {
  const [displayedValidator, setDisplayedValidator] = useState<
    MyValidator | undefined
  >();

  const totalAmount = myValidators.reduce(
    (previous, current) => previous.plus(current.stakedAmount || 0),
    new BigNumber(0)
  );

  const getColor = (index: number): string => {
    const baseColors = ["#FFFF00", "#DD1599", "#15DD89", "#00FFFF"];
    if (index < baseColors.length) return baseColors[index];

    const rangeMin = 20;
    const rangeMax = 320;
    const step = 10;

    const rangeLength = (rangeMax - rangeMin) / step;
    const colorIdx = index % rangeLength;
    const color = `hsl(${colorIdx * step}, 100%, 50%)`;
    return color;
  };

  const getFormattedPercentage = (myValidator: MyValidator): string => {
    if (!myValidator.stakedAmount) return "0%";
    return (
      myValidator.stakedAmount
        .dividedBy(totalAmount)
        .multipliedBy(100)
        .toFormat(2) + "%"
    );
  };

  const data: PieChartData[] = myValidators.map((myValidator, index) => ({
    value: myValidator.stakedAmount || 0,
    color: getColor(index),
  }));

  return (
    <article className="@sm:grid @sm:grid-cols-[270px_auto] @sm:gap-8">
      <PieChart
        id="your-staking-distribution"
        data={data}
        segmentMargin={0}
        strokeWidth={8}
        onMouseLeave={() => setDisplayedValidator(undefined)}
        onMouseEnter={(_data: PieChartData, index: number) => {
          setDisplayedValidator(myValidators[index]);
        }}
      >
        <div className="relative flex items-center justify-center max-w-[75%] mx-auto leading-tight">
          <AnimatePresence>
            <span
              className={twMerge(
                clsx("absolute transition-opacity duration-300 opacity-100", {
                  "opacity-0 pointer-events-none": displayedValidator,
                })
              )}
            >
              Your Stake Distribution
            </span>
            <span
              className={twMerge(
                clsx(
                  "flex flex-col text-neutral-500 text-sm opacity-0 pointer-events-none",
                  "transition-opacity duration-300",
                  {
                    "opacity-100 pointer-events-auto": displayedValidator,
                  }
                )
              )}
            >
              {displayedValidator?.validator.alias}
              <span className="block">
                {displayedValidator &&
                  getFormattedPercentage(displayedValidator)}
              </span>
            </span>
          </AnimatePresence>
        </div>
      </PieChart>
      <ul className="flex flex-col gap-2 mt-4 @sm:mt-2">
        {myValidators.map((myValidator) => (
          <li key={`staking-distribution-${myValidator.validator.address}`}>
            <div className="grid grid-cols-[auto_max-content] text-sm justify-between">
              <span>
                {myValidator.validator.alias ||
                  shortenAddress(myValidator.validator.address, 8, 6)}
              </span>
              <span>{getFormattedPercentage(myValidator)}</span>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
};
