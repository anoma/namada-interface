import BigNumber from "bignumber.js";

import { ProgressBar, Stack } from "@namada/components";
import { formatPercentage } from "@namada/utils";
import { VoteType, Votes, voteTypes } from "slices/proposals/types";

const colors: Record<VoteType, string> = {
  yes: "#15DD89",
  no: "#DD1599",
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

  return (
    <div>
      <span className="uppercase flex gap-1 items-baseline">
        <strong className="text-xs">{voteType} </strong>
        <span className="text-xxs text-neutral-600">{percentageString}</span>
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
  const notVotedCount = totalVotingPower.minus(
    BigNumber.sum(...Object.values(votes))
  );

  const votesAsPercentage: Record<VoteType, BigNumber> = voteTypes.reduce(
    (acc, curr) => ({
      ...acc,
      [curr]: votes[curr].dividedBy(totalVotingPower),
    }),
    {}
  );

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
          votes={notVotedCount}
          totalVotingPower={totalVotingPower}
          percentage={notVotedAsPercentage}
        />
      </Stack>
    </Stack>
  );
};

export const VoteBreakdown: React.FC<{
  votes: Votes;
  totalVotingPower: BigNumber;
}> = ({ votes, totalVotingPower }) => {
  return (
    <div className="grid grid-cols-[1fr_2px_1fr] gap-x-8">
      <VoteBreakdownHalf
        title="Voted Validators"
        subtitle="TODO"
        votes={votes}
        totalVotingPower={totalVotingPower}
      />

      <hr className="border-0 border-r h-full border-neutral-800" />

      <VoteBreakdownHalf
        title="Voted Accounts"
        subtitle="TODO"
        votes={votes}
        totalVotingPower={totalVotingPower}
      />
    </div>
  );
};
