import { twMerge } from "tailwind-merge";

import { AddRemove, PgfActions, Proposal } from "@namada/types";

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
        content={<span>{addRemove.add}</span>}
      />
      <InfoCard
        title="Remove"
        className="col-span-3"
        content={addRemove.remove.map((address) => (
          <span key={`info-card-remove-${address}`}>{address}</span>
        ))}
      />
    </>
  );
};

const PgfPaymentInfoCards: React.FC<{
  pgfActions: PgfActions;
}> = ({ pgfActions }) => {
  return (
    <>
      <InfoCard
        title="Continuous Add"
        className="col-span-full"
        content={pgfActions.continuous.add.map(
          ({ internal: { amount, target } }) => (
            <span key={`info-card-continuous-add-${target}`}>
              {target} {amount.toString()} NAM
            </span>
          )
        )}
      />
      <InfoCard
        title="Continuous Remove"
        className="col-span-full"
        content={pgfActions.continuous.remove.map(
          ({ internal: { amount, target } }) => (
            <span key={`info-card-continuous-remove-${target}`}>
              {target} {amount.toString()} NAM
            </span>
          )
        )}
      />
      <InfoCard
        title="Retro"
        className="col-span-full"
        content={pgfActions.retro.map(({ internal: { amount, target } }) => (
          <span key={`info-card-retro-${target}`}>
            {target} {amount.toString()} NAM
          </span>
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
        title="Activation Epoch"
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
      {proposal.proposalType.type === "pgf_payment" && (
        <PgfPaymentInfoCards pgfActions={proposal.proposalType.data} />
      )}
    </div>
  );
};
