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

const Layout: React.FC<{
  pieChartData?: PieChartData[];
  percentages: Record<VoteType, string>;
  amounts: Record<VoteType, string>;
  turnout: string;
  quorum: string;
  pieChartMiddle?: React.ReactNode;
  hoveredVoteType?: VoteType;
  onMouseEnter?: (data: PieChartData, index: number) => void;
  onMouseLeave?: () => void;
}> = ({
  pieChartData,
  percentages,
  amounts,
  turnout,
  quorum,
  pieChartMiddle,
  hoveredVoteType,
  onMouseEnter,
  onMouseLeave,
}) => (
  <Stack className="@sm:flex-row" gap={4}>
    <PieChart
      id="proposal-status-pie-chart"
      data={pieChartData || [{ value: 1, color: "#1B1B1B" }]}
      segmentMargin={0}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {pieChartMiddle}
    </PieChart>

    <div className="contents w-full @sm:block">
      <Stack as="ul" gap={1}>
        {voteTypes.map((voteType, i) => (
          <StatusListItem
            key={i}
            color={colors[voteType]}
            leftContent={voteType}
            rightContent={percentages[voteType]}
            rightSubContent={amounts[voteType]}
            selected={hoveredVoteType === voteType}
          />
        ))}
      </Stack>

      <div className="@sm:mt-6">
        <h3 className="text-[#A3A3A3] text-xs">Turnout / Quorum</h3>
        <p className="text-xl">
          {turnout} / {quorum}
        </p>
      </div>
    </div>
  </Stack>
);

type ProposalStatusSummaryProps =
  | {
      loading: false;
      proposal: Proposal;
      status: ProposalStatus;
    }
  | { loading: true };

export const ProposalStatusSummary: React.FC<ProposalStatusSummaryProps> = (
  props
) => {
  if (props.loading) {
    return (
      <Layout
        percentages={{
          yay: "%",
          nay: "%",
          abstain: "%",
        }}
        amounts={{
          yay: "NAM",
          nay: "NAM",
          abstain: "NAM",
        }}
        turnout="%"
        quorum="%"
        pieChartMiddle={
          <div className="text-sm text-[#B0B0B0] animate-pulse">
            Syncing Data
          </div>
        }
      />
    );
  } else {
    return <Loaded proposal={props.proposal} status={props.status} />;
  }
};

const Loaded: React.FC<{
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

  const votedProportion =
    status.totalVotingPower.isEqualTo(0) ?
      BigNumber(0)
    : yayNayAbstainSummedPower.dividedBy(status.totalVotingPower);

  const quorum = quorumMap[proposal.tallyType];

  const percentageString = (value: BigNumber): string => {
    const voteProportion =
      zeroVotes ? BigNumber(0) : value.dividedBy(yayNayAbstainSummedPower);

    return formatPercentage(voteProportion, 2);
  };

  const data: PieChartData[] | undefined =
    zeroVotes ? undefined : (
      voteTypes.map((voteType) => ({
        value: status[voteType],
        color: colors[voteType],
      }))
    );

  const handleMouseEnter = (_data: PieChartData, index: number): void => {
    if (!zeroVotes) {
      setHoveredVoteType(voteTypes[index]);
    }
  };

  const handleMouseLeave = (): void => setHoveredVoteType(undefined);

  const pieChartMiddle = (
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
  );

  const percentages = {
    yay: percentageString(status.yay),
    nay: percentageString(status.nay),
    abstain: percentageString(status.abstain),
  };

  const amountString = (voteType: VoteType): string =>
    status[voteType].toString() + " NAM";

  const amounts = {
    yay: amountString("yay"),
    nay: amountString("nay"),
    abstain: amountString("abstain"),
  };

  return (
    <Layout
      pieChartData={data}
      percentages={percentages}
      amounts={amounts}
      turnout={formatPercentage(votedProportion, 2)}
      quorum={formatPercentage(quorum, 2)}
      pieChartMiddle={pieChartMiddle}
      hoveredVoteType={hoveredVoteType}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
};
