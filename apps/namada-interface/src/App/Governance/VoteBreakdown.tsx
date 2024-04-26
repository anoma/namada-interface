import BigNumber from "bignumber.js";

import { ProgressBar, Stack } from "@namada/components";
import { VoteType, voteTypes } from "slices/proposals";
import { colors } from "./types";

const VoteTypeBreakdown: React.FC<{
  voteType: VoteType;
  votes: BigNumber;
  totalVotes: BigNumber;
}> = ({ voteType, votes, totalVotes }) => (
  <div>
    <span className="uppercase">{voteType}</span>
    <ProgressBar
      value={{ value: votes, color: colors[voteType] }}
      total={{ value: totalVotes, color: "#000000" }}
      className="h-[5px]"
    />
  </div>
);

export const VoteBreakdownHalf: React.FC<{
  title: string;
  subtitle: string;
  votes: Record<VoteType, BigNumber>;
}> = ({ title, subtitle, votes }) => {
  const totalVotes = Object.values(votes).reduce(
    (acc, curr) => acc.plus(curr),
    BigNumber(0)
  );

  return (
    <Stack gap={2}>
      <h3 className="text-[#8A8A8A]">{title}</h3>
      <p className="text-3xl">{subtitle}</p>

      {voteTypes.map((voteType, index) => (
        <VoteTypeBreakdown
          voteType={voteType}
          votes={votes[voteType]}
          totalVotes={totalVotes}
          key={index}
        />
      ))}
    </Stack>
  );
};

export const VoteBreakdown: React.FC = () => {
  const votes: Record<VoteType, BigNumber> = {
    yes: BigNumber(1000),
    no: BigNumber(130.9292),
    veto: BigNumber(232.229),
    abstain: BigNumber(120),
  };

  return (
    <div className="grid grid-cols-[1fr_2px_1fr] gap-x-4">
      <VoteBreakdownHalf
        title="Voted Validators"
        subtitle="80/257"
        votes={votes}
      />

      <b className="bg-[#151515]" />

      <VoteBreakdownHalf
        title="Voted Accounts"
        subtitle="50,000"
        votes={votes}
      />
    </div>
  );
};
