import BigNumber from "bignumber.js";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";

import { PieChart, PieChartData, Stack } from "@namada/components";
import { formatPercentage } from "@namada/utils";

import {
  Proposal,
  ProposalStatus,
  TallyType,
  VoteType,
  voteTypes,
} from "@namada/types";
import { AnimatePresence } from "framer-motion";
import { colors } from "./types";

// TODO: is this a good enough way to represent rational numbers?
const quorumMap: Record<TallyType, BigNumber> = {
  "two-thirds": BigNumber(2).dividedBy(3),
  "one-half-over-one-third": BigNumber(1).dividedBy(3),
  "less-one-half-over-one-third-nay": BigNumber(1).dividedBy(3),
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
      className={clsx(
        "rounded-sm leading-tight py-1 px-3 flex justify-between",
        "border-transparent border-2",
        "transition-all ease-out-quad duration-100"
      )}
      style={{
        color,
        borderColor: selected ? color : "#1B1B1B",
        backgroundColor:
          selected ? `rgb(from ${color} r g b / 0.1)` : "#1B1B1B",
      }}
    >
      <div className="uppercase text-sm">{leftContent}</div>
      <div className="text-right">
        <div className="text-sm">{rightContent}</div>
        <div className="text-xxs">{rightSubContent}</div>
      </div>
    </li>
  );
};

export const ProposalStatusSummary: React.FC<{
  proposal: Proposal;
  status: ProposalStatus;
}> = ({ proposal, status }) => {
  const [hoveredVoteType, setHoveredVoteType] = useState<
    VoteType | undefined
  >();

  const yayNayAbstainSummedPower = BigNumber.sum(
    status.yay,
    status.nay,
    status.abstain
  );

  const zeroVotes = yayNayAbstainSummedPower.isEqualTo(0);

  const votedProportion = yayNayAbstainSummedPower.dividedBy(
    status.totalVotingPower
  );

  const quorum = quorumMap[proposal.tallyType];

  const percentageString = (value: BigNumber): string => {
    const voteProportion =
      zeroVotes ? BigNumber(0) : value.dividedBy(yayNayAbstainSummedPower);

    return formatPercentage(voteProportion, 2);
  };

  const data: PieChartData[] =
    zeroVotes ?
      [{ value: 1, color: "#2F2F2F" }]
    : voteTypes.map((voteType) => ({
        value: status[voteType],
        color: colors[voteType],
      }));

  const handleMouseEnter = (_data: PieChartData, index: number): void => {
    if (!zeroVotes) {
      setHoveredVoteType(voteTypes[index]);
    }
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
        <AnimatePresence>
          {typeof hoveredVoteType !== "undefined" && (
            <motion.article
              className="leading-tight"
              style={{ color: colors[hoveredVoteType] }}
              transition={{ duration: 0.1 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="uppercase text-sm">{hoveredVoteType}</div>
              <div className="text-3xl">
                {percentageString(status[hoveredVoteType])}
              </div>
            </motion.article>
          )}
        </AnimatePresence>
      </PieChart>

      <Stack as="ul" gap={1}>
        {voteTypes.map((voteType, i) => (
          <StatusListItem
            key={i}
            color={colors[voteType]}
            leftContent={voteType}
            rightContent={percentageString(status[voteType])}
            rightSubContent={status[voteType].toString() + " NAM"}
            selected={hoveredVoteType === voteType}
          />
        ))}
      </Stack>

      <div>
        <h3 className="text-[#A3A3A3] text-xs">Turnout / Quorum</h3>
        <p className="text-xl">
          {formatPercentage(votedProportion, 2)} / {formatPercentage(quorum, 2)}
        </p>
      </div>
    </Stack>
  );
};
