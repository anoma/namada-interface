import BigNumber from "bignumber.js";
import { twMerge } from "tailwind-merge";

import { formatPercentage } from "@namada/utils";

export type SegmentedBarData = {
  value: number | BigNumber | bigint;
  color: string;
};

export const SegmentedBar: React.FC<
  {
    data: SegmentedBarData[];
  } & React.ComponentProps<"div">
> = ({ data, className, ...rest }) => {
  if (data.length === 0) {
    return null;
  }

  const percentage = (value: number | BigNumber | bigint): string => {
    const total = data.reduce(
      (acc, curr) => acc.plus(BigNumber(curr.value.toString())),
      BigNumber(0)
    );

    return formatPercentage(BigNumber(value.toString()).dividedBy(total), 2);
  };

  const init = data.slice(0, -1);
  const last = data[data.length - 1];

  return (
    <div className={twMerge("w-full h-[6px] flex", className)} {...rest}>
      {init.map(({ value, color }, index) => (
        <div
          key={index}
          style={{ flexBasis: percentage(value), backgroundColor: color }}
        ></div>
      ))}
      <div className="grow" style={{ backgroundColor: last.color }}></div>
    </div>
  );
};
