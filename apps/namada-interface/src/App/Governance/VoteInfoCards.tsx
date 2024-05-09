import { twMerge } from "tailwind-merge";

import { Proposal } from "@namada/types";

import { formatEpoch } from "@namada/utils";

const InfoCard: React.FC<
  {
    title: string;
    content: string;
  } & React.ComponentProps<"div">
> = ({ title, content, className, ...rest }) => (
  <div
    className={twMerge("bg-[#1B1B1B] rounded-sm px-3 py-2", className)}
    {...rest}
  >
    <div className="text-xs text-[#8A8A8A]">{title}</div>
    <div className="text-sm">{content}</div>
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
      <InfoCard
        title="Grace Epoch"
        content={formatEpoch(proposal.graceEpoch)}
      />
      <InfoCard
        title="Proposer"
        content={proposal.author}
        className="col-span-full"
      />
    </div>
  );
};
