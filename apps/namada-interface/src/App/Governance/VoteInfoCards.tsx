import { twMerge } from "tailwind-merge";

import { Proposal } from "slices/proposals/types";

import { formatEpoch } from "@namada/utils";

const InfoCard: React.FC<
  {
    title: string;
    content: string;
  } & React.ComponentProps<"div">
> = ({ title, content, className, ...rest }) => (
  <div className={twMerge("bg-[#1B1B1B] rounded-sm p-2", className)} {...rest}>
    <div className="text-sm text-[#8A8A8A]">{title}</div>
    <div className="text-base">{content}</div>
  </div>
);

export const VoteInfoCards: React.FC<{
  proposal: Proposal;
}> = ({ proposal }) => {
  return (
    <div className="grid grid-cols-3 gap-2 m-4">
      <InfoCard
        title="Voting Start"
        content={formatEpoch(proposal.startEpoch)}
      />
      <InfoCard title="Voting End" content={formatEpoch(proposal.endEpoch)} />
      <InfoCard title="Submit Time" content="TODO" />
      <InfoCard title="Deposit End" content="TODO" />
      <InfoCard title="Initial Deposit" content="TODO" />
      <InfoCard title="Initial Deposit" content="TODO" />
      <InfoCard
        title="Proposer"
        content={proposal.author}
        className="col-span-full"
      />
    </div>
  );
};
