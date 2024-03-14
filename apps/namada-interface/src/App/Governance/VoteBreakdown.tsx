import BigNumber from "bignumber.js";

import { ProgressBar, Stack } from "@namada/components";
import {
  Vote,
  VoteType,
  isDelegatorVote,
  isValidatorVote,
  voteTypes,
} from "@namada/types";
import { formatPercentage } from "@namada/utils";

const colors: Record<VoteType | "not voted", string> = {
  yay: "#15DD89",
  nay: "#DD1599",
  abstain: "#FF8A00",
  "not voted": "#686868",
};

const VoteTypeBreakdown: React.FC<{
  voteType: VoteType | "not voted";
  votes: BigNumber;
  percentage: BigNumber;
  totalVotingPower: BigNumber;
}> = ({ voteType, votes, percentage, totalVotingPower }) => {
  const percentageString = formatPercentage(percentage, 2);
  const namString = votes.toString() + " NAM";

  return (
    <div>
      <span className="uppercase flex gap-1 items-baseline">
        <strong className="text-xs">{voteType} </strong>
        <span className="text-xxs text-neutral-600">{percentageString}</span>
        <span className="text-xxs text-neutral-600">{namString}</span>
      </span>
      <ProgressBar
        value={{ value: votes, color: colors[voteType] }}
        total={{ value: totalVotingPower, color: "#000000" }}
        className="h-[5px]"
      />
    </div>
  );
};

export const VoteBreakdownHalf: React.FC<{
  title: string;
  subtitle: string;
  votes: Record<VoteType, BigNumber>;
  totalVotingPower: BigNumber;
}> = ({ title, subtitle, votes, totalVotingPower }) => {
  const notVotedAmount = totalVotingPower.minus(
    BigNumber.sum(...Object.values(votes))
  );

  const votesAsPercentage: Record<VoteType, BigNumber> = {
    yay: votes.yay.dividedBy(totalVotingPower),
    nay: votes.nay.dividedBy(totalVotingPower),
    abstain: votes.abstain.dividedBy(totalVotingPower),
  };

  const notVotedAsPercentage = BigNumber(1).minus(
    BigNumber.sum(...Object.values(votesAsPercentage))
  );

  return (
    <Stack gap={2} className="pb-8">
      <header>
        <h3 className="text-neutral-500 text-xs">{title}</h3>
        <p className="text-2xl">{subtitle}</p>
      </header>
      <Stack gap={5}>
        {voteTypes.map((voteType, index) => (
          <VoteTypeBreakdown
            voteType={voteType}
            votes={votes[voteType]}
            percentage={votesAsPercentage[voteType]}
            totalVotingPower={totalVotingPower}
            key={index}
          />
        ))}

        <VoteTypeBreakdown
          voteType="not voted"
          votes={notVotedAmount}
          totalVotingPower={totalVotingPower}
          percentage={notVotedAsPercentage}
        />
      </Stack>
    </Stack>
  );
};

export const VoteBreakdown: React.FC<{
  votes: Vote[];
  totalVotingPower: BigNumber;
  validatorCount: number;
}> = ({ votes, totalVotingPower, validatorCount }) => {
  const votedCount = votes.length;

  const validatorVotes = votes.filter(isValidatorVote);
  const votedValidatorCount = validatorVotes.length;

  const validatorVotesSummary = validatorVotes.reduce(
    (acc, { voteType, votingPower }) => ({
      ...acc,
      [voteType]: acc[voteType].plus(votingPower),
    }),
    { yay: BigNumber(0), nay: BigNumber(0), abstain: BigNumber(0) }
  );

  const delegatorVotes = votes.filter(isDelegatorVote);
  const delegatorVotesSummary = delegatorVotes.reduce(
    (acc, { voteType, votingPower }) => {
      const votingPowerSummed = votingPower.reduce(
        (acc, [_, amount]) => acc.plus(amount),
        BigNumber(0)
      );

      return {
        ...acc,
        [voteType]: acc[voteType].plus(votingPowerSummed),
      };
    },
    { yay: BigNumber(0), nay: BigNumber(0), abstain: BigNumber(0) }
  );

  return (
    <div className="grid grid-cols-[1fr_2px_1fr] gap-x-8">
      <VoteBreakdownHalf
        title="Voted Validators"
        subtitle={`${votedValidatorCount} / ${validatorCount}`}
        votes={validatorVotesSummary}
        totalVotingPower={totalVotingPower}
      />

      <hr className="border-0 border-r h-full border-neutral-800" />

      <VoteBreakdownHalf
        title="Voted Accounts"
        subtitle={`${votedCount}`}
        votes={delegatorVotesSummary}
        totalVotingPower={totalVotingPower}
      />
    </div>
  );
};
