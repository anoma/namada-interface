import { NamCurrency } from "App/Common/NamCurrency";
import { twMerge } from "tailwind-merge";

import { SkeletonLoading } from "@namada/components";
import { AddRemove, PgfActions } from "@namada/types";

import { useAtomValue } from "jotai";
import { proposalFamilyPersist, StoredProposal } from "slices/proposals";
import { showEpoch } from "utils";

const InfoCard: React.FC<
  {
    title: React.ReactNode;
    content: React.ReactNode;
  } & Omit<React.ComponentProps<"div">, "title" | "content">
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
              {target}{" "}
              <NamCurrency amount={amount} forceBalanceDisplay={true} />
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
              {target}{" "}
              <NamCurrency amount={amount} forceBalanceDisplay={true} />
            </span>
          )
        )}
      />
      <InfoCard
        title="Retro"
        className="col-span-full"
        content={pgfActions.retro.map(({ internal: { amount, target } }) => (
          <span key={`info-card-retro-${target}`}>
            {target} <NamCurrency amount={amount} forceBalanceDisplay={true} />
          </span>
        ))}
      />
    </>
  );
};

export const VoteInfoCards: React.FC<{
  proposalId: bigint;
}> = ({ proposalId }) => {
  const proposal = useAtomValue(proposalFamilyPersist(proposalId));

  return (
    <div className="grid grid-cols-6 gap-2 m-4">
      {proposal.status === "pending" || proposal.status === "error" ?
        <>
          <LoadingCard className="col-span-2" />
          <LoadingCard className="col-span-2" />
          <LoadingCard className="col-span-2" />
          <LoadingCard className="col-span-full" />
        </>
      : <Loaded proposal={proposal.data} />}
    </div>
  );
};

const LoadingCard: React.FC<{ className?: string }> = ({ className }) => (
  <InfoCard
    title={<SkeletonLoading height="20px" width="50%" />}
    content={<SkeletonLoading height="20px" width="100%" />}
    className={className}
  />
);

const Loaded: React.FC<{
  proposal: StoredProposal;
}> = ({ proposal }) => {
  return (
    <>
      <InfoCard
        title="Voting Start"
        content={showEpoch(proposal.startEpoch)}
        className="col-span-2"
      />
      <InfoCard
        title="Voting End"
        content={showEpoch(proposal.endEpoch)}
        className="col-span-2"
      />
      <InfoCard
        title="Activation Epoch"
        content={showEpoch(proposal.activationEpoch)}
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
    </>
  );
};
