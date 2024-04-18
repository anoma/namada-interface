import BigNumber from "bignumber.js";
import clsx from "clsx";
import { useState } from "react";

import { PieChart, PieChartData, Stack } from "@namada/components";
import { formatPercentage } from "@namada/utils";

const voteTypes = ["yes", "no", "veto", "abstain"];
type VoteType = (typeof voteTypes)[number];

const colors: Record<VoteType, string> = {
  yes: "#15DD89",
  no: "#DD1599",
  veto: "#FF8A00",
  abstain: "#686868",
};

const StatusListItem: React.FC<{
  color: string;
  leftContent: string;
  rightContent: string;
  rightSubContent: string;
  selected: boolean;
}> = ({ color, leftContent, rightContent, rightSubContent, selected }) => {
  return (
    <li
      className={clsx("rounded-sm border-2 p-2 flex justify-between")}
      style={{
        color,
        borderColor: selected ? color : "#1B1B1B",
        backgroundColor:
          selected ? `rgb(from ${color} r g b / 0.1)` : "#1B1B1B",
      }}
    >
      <div className="uppercase">{leftContent}</div>
      <div className="text-right">
        <div>{rightContent}</div>
        <div className="text-xs">{rightSubContent}</div>
      </div>
    </li>
  );
};

export const ProposalStatus: React.FC = () => {
  const votes: Record<VoteType, BigNumber> = {
    yes: BigNumber(1674.765),
    no: BigNumber(378.345),
    veto: BigNumber(200.213),
    abstain: BigNumber(1600.765),
  };

  const [hoveredVoteType, setHoveredVoteType] = useState<
    VoteType | undefined
  >();

  const percentageString = (value: BigNumber): string => {
    const totalVotes = BigNumber.sum(...Object.values(votes));
    return formatPercentage(value.dividedBy(totalVotes), 2);
  };

  const data: PieChartData[] = voteTypes.map((voteType) => ({
    value: votes[voteType],
    color: colors[voteType],
  }));

  const handleMouseEnter = (_data: PieChartData, index: number): void => {
    setHoveredVoteType(voteTypes[index]);
  };

  const handleMouseLeave = (): void => setHoveredVoteType(undefined);

  return (
    <Stack gap={4}>
      <PieChart
        id="proposal-status-pie-chart"
        data={data}
        segmentMargin={0}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {typeof hoveredVoteType !== "undefined" && (
          <div style={{ color: colors[hoveredVoteType] }}>
            <div className="uppercase">{hoveredVoteType}</div>
            <div className="text-3xl">
              {percentageString(votes[hoveredVoteType])}
            </div>
          </div>
        )}
      </PieChart>

      <Stack as="ul" gap={1}>
        {voteTypes.map((voteType, i) => (
          <StatusListItem
            key={i}
            color={colors[voteType]}
            leftContent={voteType}
            rightContent={percentageString(votes[voteType])}
            rightSubContent={votes[voteType].toString() + " NAM"}
            selected={hoveredVoteType === voteType}
          />
        ))}
      </Stack>

      <div>
        <h3 className="text-[#A3A3A3] text-xs">Turnout / Quorum</h3>
        <p className="text-xl">7.3% / 40.0%</p>
      </div>
    </Stack>
  );
};
