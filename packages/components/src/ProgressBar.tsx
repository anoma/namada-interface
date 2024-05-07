import BigNumber from "bignumber.js";

import { SegmentedBar, SegmentedBarData } from "./SegmentedBar";

export const ProgressBar: React.FC<
  {
    value: SegmentedBarData;
    total: SegmentedBarData;
  } & Omit<React.ComponentProps<typeof SegmentedBar>, "data">
> = ({ value, total, ...rest }) => {
  const data = [
    value,
    {
      ...total,
      value: BigNumber.max(
        0,
        BigNumber(total.value.toString()).minus(value.value.toString())
      ),
    },
  ];

  return <SegmentedBar data={data} {...rest} />;
};
