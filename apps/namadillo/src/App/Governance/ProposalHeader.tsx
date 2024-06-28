import {
  ActionButton,
  ProgressBar as ProgressBarComponent,
  Stack,
} from "@namada/components";
import { Proposal, ProposalStatus } from "@namada/types";
import {
  StoredProposal,
  proposalFamily,
  proposalFamilyPersist,
  proposalVotedFamily,
} from "atoms/proposals";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { AtomWithQueryResult } from "jotai-tanstack-query";
import { FaChevronLeft } from "react-icons/fa";
import { SiWebassembly } from "react-icons/si";
import { VscJson } from "react-icons/vsc";
import { Link, useNavigate } from "react-router-dom";
import { showEpoch, showProposalId } from "utils";
import {
  StatusLabel as StatusLabelComponent,
  TypeLabel as TypeLabelComponent,
  VotedLabel as VotedLabelComponent,
} from "./ProposalLabels";
import GovernanceRoutes from "./routes";

export const ProposalHeader: React.FC<{
  proposalId: bigint;
}> = ({ proposalId }) => {
  const proposal = useAtomValue(proposalFamily(proposalId));
  const cachedProposal = useAtomValue(proposalFamilyPersist(proposalId));
  const voted = useAtomValue(proposalVotedFamily(proposalId));

  return (
    <>
      <div className="flex mb-5">
        <div className="w-full">
          <Breadcrumbs proposalId={proposalId} />
          <BackButton />
          <Stack gap={2.5}>
            <TypeLabel proposal={cachedProposal} />
            <Title proposal={cachedProposal} proposalId={proposalId} />
          </Stack>
        </div>
        <Stack gap={2}>
          <JsonButton proposalId={proposalId} />
          <WasmButton proposal={cachedProposal} />
        </Stack>
      </div>
      <hr className="border-neutral-900 w-full mb-4" />
      <div className="flex gap-2 mb-4">
        <StatusLabel proposal={proposal} cachedProposal={cachedProposal} />
        <VotedLabel voted={voted} />
      </div>
      <div className="flex gap-10 bg-neutral-900 mb-9 px-5 py-3 -mx-3 rounded-md">
        <Progress proposal={cachedProposal} />
        <VoteButton proposal={proposal} voted={voted} proposalId={proposalId} />
      </div>
    </>
  );
};

const Title: React.FC<{
  proposal: AtomWithQueryResult<StoredProposal>;
  proposalId: bigint;
}> = ({ proposal, proposalId }) => (
  <div className="text-xl">
    {showProposalId(proposalId)}{" "}
    {proposal.status === "pending" || proposal.status === "error" ? null : (
      proposal.data.content.title
    )}
  </div>
);

const Breadcrumbs: React.FC<{ proposalId: bigint }> = ({ proposalId }) => (
  <div className="text-xxs text-neutral-500">
    <Link
      className="transition-colors hover:text-white"
      to={GovernanceRoutes.index()}
    >
      Governance
    </Link>{" "}
    /&nbsp;
    <Link
      className="transition-colors hover:text-white"
      to={GovernanceRoutes.proposal(proposalId).url}
    >
      Proposal {showProposalId(proposalId)}
    </Link>
  </div>
);

const BackButton: React.FC = () => (
  <Link
    to={GovernanceRoutes.index()}
    className={clsx(
      "inline-flex items-center text-xxs gap-1",
      "text-neutral-200 bg-neutral-900 my-2 px-2 py-0.5 rounded-sm",
      "hover:text-yellow"
    )}
  >
    <i className="text-[0.8em]">
      <FaChevronLeft />
    </i>{" "}
    Back
  </Link>
);

const TypeLabel: React.FC<{
  proposal: AtomWithQueryResult<StoredProposal>;
}> = ({ proposal }) =>
  proposal.status === "pending" || proposal.status === "error" ?
    null
  : <TypeLabelComponent proposalType={proposal.data.proposalType} />;

const JsonButton: React.FC<{
  proposalId: bigint;
}> = ({ proposalId }) => {
  const navigate = useNavigate();

  return (
    <ActionButton
      className="px-3 py-2"
      color="white"
      size="xs"
      outlined
      borderRadius="sm"
      onClick={() => navigate(GovernanceRoutes.viewJson(proposalId).url)}
    >
      <span className="flex text-xs justify-between gap-2">
        <VscJson />
        JSON
      </span>
    </ActionButton>
  );
};

const WasmButton: React.FC<{
  proposal: AtomWithQueryResult<StoredProposal>;
}> = ({ proposal }) => {
  const { disabled, href, filename } = (() => {
    if (proposal.status !== "pending" && proposal.status !== "error") {
      const { proposalType } = proposal.data;
      const wasmCode =
        proposalType.type === "default_with_wasm" ?
          proposalType.data
        : undefined;

      if (typeof wasmCode !== "undefined") {
        const href = URL.createObjectURL(
          new Blob([wasmCode], { type: "application/octet-stream" })
        );

        const filename = `proposal-${proposal.data.id.toString()}.wasm`;

        return {
          disabled: false,
          href,
          filename,
        };
      }
    }

    return {
      disabled: true,
      href: undefined,
      filename: undefined,
    };
  })();

  return (
    <ActionButton
      className="px-3 py-2"
      color="white"
      size="xs"
      outlined
      borderRadius="sm"
      disabled={disabled}
      as="a"
      download={filename}
      href={href}
    >
      <span className="flex text-xs items-center justify-between gap-2">
        <SiWebassembly />
        WASM
      </span>
    </ActionButton>
  );
};

const StatusLabel: React.FC<{
  proposal: AtomWithQueryResult<Proposal>;
  cachedProposal: AtomWithQueryResult<StoredProposal>;
}> = ({ proposal, cachedProposal }) => {
  const status: ProposalStatus | undefined = (() => {
    if (proposal.status !== "pending" && proposal.status !== "error") {
      return proposal.data.status;
    } else if (
      cachedProposal.status !== "pending" &&
      cachedProposal.status !== "error"
    ) {
      return cachedProposal.data.status;
    } else {
      return undefined;
    }
  })();

  return typeof status === "undefined" ? null : (
      <StatusLabelComponent status={status} className="text-xs min-w-42" />
    );
};

const Progress: React.FC<{
  proposal: AtomWithQueryResult<StoredProposal>;
}> = ({ proposal }) => {
  return (
    <div className="w-full grid grid-cols-2 text-xs">
      <span>Progress</span>
      <div className="col-span-2 mt-3 mb-2">
        <ProgressBar cachedProposal={proposal} />
      </div>
      <ProgressStartEnd
        proposal={proposal}
        epochKey="startEpoch"
        className="col-start-1"
      />
      <ProgressStartEnd
        proposal={proposal}
        epochKey="endEpoch"
        className="text-right"
      />
    </div>
  );
};

const ProgressStartEnd: React.FC<{
  proposal: AtomWithQueryResult<StoredProposal>;
  epochKey: "startEpoch" | "endEpoch";
  className: string;
}> = ({ proposal, epochKey, className }) => (
  <div className={className}>
    {proposal.status === "pending" || proposal.status === "error" ?
      "..."
    : showEpoch(proposal.data[epochKey])}
  </div>
);

const ProgressBar: React.FC<{
  cachedProposal: AtomWithQueryResult<StoredProposal>;
}> = ({ cachedProposal: proposal }) => {
  const { value, total } = (() => {
    const loadingData = {
      value: 0,
      total: 0,
    };

    if (proposal.status === "pending" || proposal.status === "error") {
      return loadingData;
    }

    const { endTime, startTime } = proposal.data;
    const currentTime = BigInt(Math.round(Date.now() / 1000));

    const totalProgress = endTime - startTime;
    const currentProgress = currentTime - startTime;

    return {
      value: currentProgress,
      total: totalProgress,
    };
  })();

  return (
    <ProgressBarComponent
      value={{ value, color: "#11DFDF" }}
      total={{ value: total, color: "#3A3A3A" }}
    />
  );
};

const VoteButton: React.FC<{
  proposal: AtomWithQueryResult<Proposal>;
  voted: boolean | undefined;
  proposalId: bigint;
}> = ({ proposal, voted, proposalId }) => {
  const navigate = useNavigate();
  const isExtensionConnected = useAtomValue(namadaExtensionConnectedAtom);

  if (!isExtensionConnected) {
    return null;
  }

  const { disabled, onClick, text } = (() => {
    if (
      proposal.status === "pending" ||
      proposal.status === "error" ||
      typeof voted === "undefined"
    ) {
      return {
        disabled: true,
        onClick: undefined,
        text: "Vote",
      };
    } else {
      const { status } = proposal.data;

      const disabled = !isExtensionConnected || status !== "ongoing";

      const text = voted ? "Edit Vote" : "Vote";

      return {
        disabled,
        onClick: () => navigate(GovernanceRoutes.submitVote(proposalId).url),
        text,
      };
    }
  })();

  return (
    <div className="w-32 flex items-center justify-center">
      <ActionButton
        size="sm"
        borderRadius="sm"
        className="py-2 px-4"
        color="white"
        disabled={disabled}
        onClick={onClick}
      >
        {text}
      </ActionButton>
    </div>
  );
};

const VotedLabel: React.FC<{
  voted: boolean | undefined;
}> = ({ voted }) =>
  voted ? <VotedLabelComponent className="text-xs min-w-22" /> : null;
