import BigNumber from "bignumber.js";

import { PieChart, PieChartData, Stack } from "@namada/components";

export const ProposalStatus: React.FC = () => {
  const data: PieChartData[] = [
    { value: BigNumber(1674.765), color: "#15DD89" },
    { value: BigNumber(378.345), color: "#DD1599" },
    { value: BigNumber(123.345), color: "#686868" },
  ];

  return (
    <Stack gap={4}>
      <PieChart id="proposal-status-pie-chart" data={data} segmentMargin={0} />
    </Stack>
  );
};
