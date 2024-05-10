import { twMerge } from "tailwind-merge";

import { AddRemove, Proposal } from "@namada/types";

import { formatEpoch } from "@namada/utils";

const InfoCard: React.FC<
  {
    title: string;
    content: React.ReactNode;
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

const PgfStewardInfoCards: React.FC<{
  addRemove: AddRemove;
}> = ({ addRemove }) => {
  return (
    <>
      <InfoCard
        title="Add"
        className="col-span-3"
        content={addRemove.add.map((address) => (
          <span>{address}</span>
        ))}
      />
      <InfoCard
        title="Remove"
        className="col-span-3"
        content={addRemove.remove.map((address) => (
          <span>{address}</span>
        ))}
      />
    </>
  );
};

export const VoteInfoCards: React.FC<{
  proposal: Proposal;
}> = ({ proposal }) => {
  return (
    <div className="grid grid-cols-6 gap-2 m-4">
      <InfoCard
        title="Voting Start"
        content={formatEpoch(proposal.startEpoch)}
        className="col-span-2"
      />
      <InfoCard
        title="Voting End"
        content={formatEpoch(proposal.endEpoch)}
        className="col-span-2"
      />
      <InfoCard
        title="Grace Epoch"
        content={formatEpoch(proposal.graceEpoch)}
        className="col-span-2"
      />
      <InfoCard
        title="Proposer"
        content={proposal.author}
        className="col-span-full"
      />
      {proposal.proposalType.type === "pgf_steward" && (
        <PgfStewardInfoCards addRemove={proposal.proposalType.data} />
      )}
    </div>
  );
};
