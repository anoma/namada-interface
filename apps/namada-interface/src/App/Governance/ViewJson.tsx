import { useSanitizedParams } from "@namada/hooks";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";

import { Modal } from "@namada/components";
import { PgfTarget, Proposal } from "@namada/types";
import { assertNever, copyToClipboard } from "@namada/utils";
import { ModalContainer } from "App/Common/ModalContainer";
import clsx from "clsx";
import { useState } from "react";
import { GoCheck, GoCopy } from "react-icons/go";
import { proposalFamily } from "slices/proposals";
import GovernanceRoutes from "./routes";

type DefaultData = undefined; // TODO: support displaying WASM bytes

type PgfStewardData = {
  add?: string;
  remove: string[];
};

// TODO: add IBC target
type PgfTargetJson = {
  internal: {
    target: string;
    amount: string;
  };
};

type PgfPaymentData = {
  continuous: PgfTargetJson[];
  retro: PgfTargetJson[];
};

type DataJson = DefaultData | PgfStewardData | PgfPaymentData;

type ProposalJson = {
  proposal: {
    id: bigint;
    content: { [key: string]: string | undefined };
    author: string;
    voting_start_epoch: bigint;
    voting_end_epoch: bigint;
    grace_epoch: bigint;
  };
  data: DataJson;
};

const formatPgfTarget = (value: PgfTarget): PgfTargetJson => ({
  internal: {
    target: value.internal.target,
    amount: value.internal.amount.toString(),
  },
});

const formatData = (proposal: Proposal): DataJson => {
  switch (proposal.proposalType.type) {
    case "default":
      return undefined;

    case "pgf_steward":
      const addRemove = proposal.proposalType.data;

      // deliberately specify keys to ensure no unwanted data is printed
      return {
        add: addRemove.add,
        remove: addRemove.remove,
      };

    case "pgf_payment":
      const pgfActions = proposal.proposalType.data;

      const continuous = [
        ...pgfActions.continuous.add,
        ...pgfActions.continuous.remove,
      ].map(formatPgfTarget);

      const retro = pgfActions.retro.map(formatPgfTarget);

      // deliberately specify keys to ensure no unwanted data is printed
      return { continuous, retro };

    default:
      return assertNever(proposal.proposalType);
  }
};

export const ViewJson: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { proposalId: proposalIdString = "" } = useSanitizedParams();
  // TODO: validate we got a number
  const proposalId = BigInt(Number.parseInt(proposalIdString));
  const proposalQueryResult = useAtomValue(proposalFamily(proposalId));

  if (Number.isNaN(proposalId) || !proposalQueryResult.isSuccess) {
    navigate(GovernanceRoutes.overview().url);
    return null;
  }

  const proposal = proposalQueryResult.data;

  const proposalJson: ProposalJson = {
    proposal: {
      id: proposal.id,
      content: proposal.content,
      author: proposal.author,
      voting_start_epoch: proposal.startEpoch,
      voting_end_epoch: proposal.endEpoch,
      grace_epoch: proposal.graceEpoch,
    },
    data: formatData(proposal),
  };

  const stringified = JSON.stringify(
    proposalJson,
    // TODO: This is not technically safe to cast BigInt to Number, but in
    // practice is probably fine. Still, we should consider replacing this code.
    (_, value) => (typeof value === "bigint" ? Number(value) : value),
    2
  );

  const onCloseModal = (): void =>
    navigate(GovernanceRoutes.proposal(proposal.id).url);

  const onCopy = (): void => {
    if (!copied) {
      setCopied(true);
      copyToClipboard(stringified);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal onClose={onCloseModal}>
      <ModalContainer header={null} onClose={onCloseModal}>
        <i
          className={clsx(
            "border border-current rounded-sm p-1 absolute",
            "text-lg top-6 right-17 text-white transition-colors",
            { "hover:text-yellow cursor-pointer": !copied }
          )}
          onClick={onCopy}
        >
          {copied ?
            <GoCheck />
          : <GoCopy />}
        </i>
        <div className="px-8 pt-4">
          <pre className="overflow-x-auto dark-scrollbar">{stringified}</pre>
        </div>
      </ModalContainer>
    </Modal>
  );
};
