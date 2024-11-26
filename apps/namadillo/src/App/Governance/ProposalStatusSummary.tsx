import BigNumber from "bignumber.js";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

import { PieChart, PieChartData, Stack } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { proposalFamily } from "atoms/proposals";
import { useAtomValue } from "jotai";

import { ProposalStatus, TallyType, VoteType, voteTypes } from "@namada/types";
import { NamCurrency } from "App/Common/NamCurrency";
import { colors } from "./types";

// TODO: is this a good enough way to represent rational numbers?
const quorumMap: Record<TallyType, BigNumber> = {
  "two-fifths": BigNumber(2).dividedBy(5),
  "one-half-over-one-third": BigNumber(1).dividedBy(3),
  "less-one-half-over-one-third-nay": BigNumber(1).dividedBy(3),
};

const StatusListItem: React.FC<{
  color: string;
  leftContent: string;
  rightContent: string;
  rightSubContent: React.ReactNode;
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
  status: ProposalStatus;
  pieChartData?: PieChartData[];
  percentages: Record<VoteType, string>;
  amounts: Record<VoteType, React.ReactNode>;
  turnout: string;
  quorum: string;
  pieChartMiddle?: React.ReactNode;
  hoveredVoteType?: VoteType;
  onMouseEnter?: (data: PieChartData, index: number) => void;
  onMouseLeave?: () => void;
}> = ({
  status,
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

      {/* We do not want to display the turnout and quorum if the proposal is not ongoing
        as we can't get historical data to calculate it properly*/}
      {status === "ongoing" && (
        <div className="@sm:mt-6">
          <h3 className="text-[#A3A3A3] text-xs">Turnout / Quorum</h3>
          <p className="text-xl">
            {turnout} / {quorum}
          </p>
        </div>
      )}
    </div>
  </Stack>
);

export const ProposalStatusSummary: React.FC<{
  proposalId: bigint;
}> = ({ proposalId }) => {
  const proposal = useAtomValue(proposalFamily(proposalId));

  if (proposal.status === "success") {
    return <Loaded {...proposal.data} />;
  }

  return (
    <Layout
      status="pending"
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
        <div className="text-sm text-[#B0B0B0] animate-pulse">Syncing Data</div>
      }
    />
  );
};

const Loaded: React.FC<{
  status: ProposalStatus;
  yay: BigNumber;
  nay: BigNumber;
  abstain: BigNumber;
  totalVotingPower: BigNumber;
  tallyType: TallyType;
}> = (props) => {
  const { status, yay, nay, abstain, totalVotingPower, tallyType } = props;

  const yayNayAbstainSummedPower = BigNumber.sum(yay, nay, abstain);

  const zeroVotes = yayNayAbstainSummedPower.isEqualTo(0);

  const highestVoteType: VoteType | undefined =
    zeroVotes ? undefined : (
      voteTypes.reduce((a, b) => (props[a].gt(props[b]) ? a : b))
    );

  const [hoveredVoteType, setHoveredVoteType] = useState<VoteType | undefined>(
    highestVoteType
  );

  useEffect(() => {
    // Reset the hovered vote type when the highest vote type changes(on data poll)
    setHoveredVoteType(highestVoteType);
  }, [highestVoteType]);

  const votedProportion =
    totalVotingPower.isEqualTo(0) ?
      BigNumber(0)
    : yayNayAbstainSummedPower.dividedBy(totalVotingPower);

  const quorum = quorumMap[tallyType];

  const percentageString = (value: BigNumber): string => {
    const voteProportion =
      zeroVotes ? BigNumber(0) : value.dividedBy(yayNayAbstainSummedPower);

    return formatPercentage(voteProportion, 2);
  };

  const data: PieChartData[] | undefined =
    zeroVotes ? undefined : (
      voteTypes.map((voteType) => ({
        value: props[voteType],
        color: colors[voteType],
      }))
    );

  const handleMouseEnter = (_data: PieChartData, index: number): void => {
    if (!zeroVotes) {
      setHoveredVoteType(voteTypes[index]);
    }
  };

  const handleMouseLeave = (): void => setHoveredVoteType(highestVoteType);

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
            {percentageString(props[hoveredVoteType])}
          </div>
        </motion.article>
      )}
    </AnimatePresence>
  );

  const percentages = {
    yay: percentageString(yay),
    nay: percentageString(nay),
    abstain: percentageString(abstain),
  };

  const formattedAmount = (voteType: VoteType): React.ReactNode => (
    <NamCurrency amount={props[voteType]} />
  );

  const amounts = {
    yay: formattedAmount("yay"),
    nay: formattedAmount("nay"),
    abstain: formattedAmount("abstain"),
  };

  return (
    <Layout
      status={status}
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
