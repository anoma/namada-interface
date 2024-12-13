import { NamCurrency } from "App/Common/NamCurrency";
import { twMerge } from "tailwind-merge";

import { SkeletonLoading } from "@namada/components";
import {
  AddRemove,
  PgfActions,
  PgfIbcTarget,
  PgfTarget,
  Proposal,
} from "@namada/types";

import { sha256Hash } from "@namada/utils";
import { proposalFamily } from "atoms/proposals";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import { secondsToDateTimeString } from "utils";

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
    <div className="text-xs text-[#8A8A8A] mb-1">{title}</div>
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

const extractPgfInfo = (
  pgfTarget: PgfTarget | PgfIbcTarget
): { target: string; amount: BigNumber } => {
  let target: string;
  let amount: BigNumber;

  if ("internal" in pgfTarget) {
    target = pgfTarget.internal.target;
    amount = pgfTarget.internal.amount;
  } else {
    target = pgfTarget.ibc.target;
    amount = pgfTarget.ibc.amount;
  }

  return { target, amount };
};

const PgfPaymentInfoCards: React.FC<{
  pgfActions: PgfActions;
}> = ({ pgfActions }) => {
  return (
    <>
      <InfoCard
        title="Continuous Add"
        className="col-span-full"
        content={pgfActions.continuous.add.map((continuous) => {
          const { target, amount } = extractPgfInfo(continuous);

          return (
            <span key={`info-card-continuous-add-${target}`}>
              {target} <NamCurrency amount={amount} />
              {"ibc" in continuous ?
                ` ${continuous.ibc.channelId} ${continuous.ibc.portId}`
              : ""}
            </span>
          );
        })}
      />
      <InfoCard
        title="Continuous Remove"
        className="col-span-full"
        content={pgfActions.continuous.remove.map((continuous) => {
          const { target, amount } = extractPgfInfo(continuous);

          return (
            <span key={`info-card-continuous-remove-${target}`}>
              {target} <NamCurrency amount={amount} />
              {"ibc" in continuous ?
                ` ${continuous.ibc.channelId} ${continuous.ibc.portId}`
              : ""}
            </span>
          );
        })}
      />
      <InfoCard
        title="Retro"
        className="col-span-full"
        content={pgfActions.retro.map((retro) => {
          const { target, amount } = extractPgfInfo(retro);

          return (
            <span key={`info-card-retro-${target}`}>
              {target} <NamCurrency amount={amount} />
              {"ibc" in retro ?
                ` ${retro.ibc.channelId} ${retro.ibc.portId}`
              : ""}
            </span>
          );
        })}
      />
    </>
  );
};

export const VoteInfoCards: React.FC<{
  proposalId: bigint;
}> = ({ proposalId }) => {
  const proposal = useAtomValue(proposalFamily(proposalId));

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

const DateTimeEpoch: React.FC<{ date: bigint; epoch: bigint }> = ({
  date,
  epoch,
}) => (
  <div className="leading-tight">
    {secondsToDateTimeString(date)}
    <div className="text-xs text-neutral-500">Epoch {epoch.toString()}</div>
  </div>
);

const Loaded: React.FC<{
  proposal: Proposal;
}> = ({ proposal }) => {
  const [dataHash, setDataHash] = useState<string>();

  useEffect(() => {
    if (
      proposal.proposalType.type === "default_with_wasm" &&
      proposal.proposalType.data.length > 0
    ) {
      sha256Hash(proposal.proposalType.data).then((hash) =>
        setDataHash(hash.toUpperCase())
      );
    }
  }, [proposal.proposalType]);

  return (
    <>
      <InfoCard
        title="Voting Start"
        content={
          <DateTimeEpoch
            date={proposal.startTime}
            epoch={proposal.startEpoch}
          />
        }
        className="col-span-2"
      />
      <InfoCard
        title="Voting End"
        content={
          <DateTimeEpoch date={proposal.endTime} epoch={proposal.endEpoch} />
        }
        className="col-span-2"
      />
      <InfoCard
        title="Activation Time"
        content={
          <DateTimeEpoch
            date={proposal.activationTime}
            epoch={proposal.activationEpoch}
          />
        }
        className="col-span-2"
      />
      <InfoCard
        title="Proposer"
        content={proposal.author}
        className="col-span-full"
      />
      {dataHash && (
        <InfoCard
          title="Data Hash"
          content={dataHash}
          className="col-span-full"
        />
      )}
      {proposal.proposalType.type === "pgf_steward" && (
        <PgfStewardInfoCards addRemove={proposal.proposalType.data} />
      )}
      {proposal.proposalType.type === "pgf_payment" && (
        <PgfPaymentInfoCards pgfActions={proposal.proposalType.data} />
      )}
    </>
  );
};
