import { PieChart, PieChartData } from "@namada/components";
import { shortenAddress } from "@namada/utils";
import { OpacitySlides } from "App/Common/OpacitySlides";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { MyValidator } from "types";

type YourStakingDistributionProps = {
  myValidators: MyValidator[];
};

export const YourStakingDistribution = ({
  myValidators,
}: YourStakingDistributionProps): JSX.Element => {
  const [activeIndex, setActiveIndex] = useState<number>(0);

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
        onMouseLeave={() => setActiveIndex(0)}
        onMouseEnter={(_data: PieChartData, index: number) => {
          setActiveIndex(index + 1);
        }}
      >
        <div className="relative flex items-center justify-center max-w-[75%] mx-auto leading-tight">
          <OpacitySlides activeIndex={activeIndex}>
            <div>Your Stake Distribution</div>
            {myValidators.map((item, index) => (
              <div
                key={item.validator.alias ?? index}
                className="flex flex-col text-neutral-500 text-sm"
              >
                {item.validator.alias}
                <span className="block">{getFormattedPercentage(item)}</span>
              </div>
            ))}
          </OpacitySlides>
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
