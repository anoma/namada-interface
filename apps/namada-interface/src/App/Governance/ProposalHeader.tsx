import { ActionButton, ProgressBar, Stack } from "@namada/components";
import { Proposal } from "@namada/types";
import { formatEpoch } from "@namada/utils";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { FaChevronLeft } from "react-icons/fa";
import { SiWebassembly } from "react-icons/si";
import { VscJson } from "react-icons/vsc";
import { Link, useNavigate } from "react-router-dom";
import { currentEpochAtom } from "slices/proposals";
import { StatusLabel, TypeLabel, VotedLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";

const WasmButton: React.FC<{
  wasmCode?: Uint8Array;
  proposalId: bigint;
}> = ({ wasmCode, proposalId }) => {
  const href =
    typeof wasmCode === "undefined" ? undefined : (
      URL.createObjectURL(
        new Blob([wasmCode], { type: "application/octet-stream" })
      )
    );

  const filename = `proposal-${proposalId.toString()}.wasm`;

  return (
    <ActionButton
      className="px-3 py-2"
      color="white"
      size="xs"
      outlined
      borderRadius="sm"
      disabled={typeof wasmCode === "undefined"}
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

type ProposalHeaderProps = (
  | { isExtensionConnected: true; voted: boolean }
  | { isExtensionConnected: false }
) & {
  proposal: Proposal;
};

export const ProposalHeader: React.FC<ProposalHeaderProps> = (props) => {
  const { proposal, isExtensionConnected } = props;
  const { status } = proposal;

  const navigate = useNavigate();
  const voteButtonDisabled =
    !isExtensionConnected || props.voted || status !== "ongoing";
  const { startEpoch, endEpoch } = proposal;
  const currentEpoch = useAtomValue(currentEpochAtom);

  if (!currentEpoch.isSuccess) {
    return null;
  }

  const totalEpochs = endEpoch - startEpoch;
  const relativeCurrentEpoch = currentEpoch.data - startEpoch;

  const { type, data } = proposal.proposalType;
  const wasmCode = type === "default" ? data : undefined;

  return (
    <>
      <div className="flex mb-5">
        <div className="w-full">
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
              to={GovernanceRoutes.proposal(proposal.id).url}
            >
              Proposal #{proposal.id.toString()}
            </Link>
          </div>
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
          <Stack gap={2.5}>
            <TypeLabel proposalType={proposal.proposalType} />
            <div className="text-xl">
              #{proposal.id.toString()} {proposal.content.title}
            </div>
          </Stack>
        </div>
        <Stack gap={2}>
          <ActionButton
            className="px-3 py-2"
            color="white"
            size="xs"
            outlined
            borderRadius="sm"
            onClick={() => navigate(GovernanceRoutes.viewJson(proposal.id).url)}
          >
            <span className="flex text-xs justify-between gap-2">
              <VscJson />
              JSON
            </span>
          </ActionButton>
          <WasmButton wasmCode={wasmCode} proposalId={proposal.id} />
        </Stack>
      </div>
      <hr className="border-neutral-900 w-full mb-4" />
      <div className="flex gap-2 mb-4">
        <StatusLabel status={status} className="text-xs min-w-42" />
        {isExtensionConnected && props.voted && (
          <VotedLabel className="text-xs min-w-22" />
        )}
      </div>
      <div className="flex gap-10 bg-neutral-900 mb-9 px-5 py-3 -mx-3 rounded-md">
        <div className="w-full grid grid-cols-2 text-xs">
          <span>Progress</span>
          <div className="col-span-2 mt-3 mb-2">
            <ProgressBar
              value={{ value: relativeCurrentEpoch, color: "#11DFDF" }}
              total={{ value: totalEpochs, color: "#3A3A3A" }}
            />
          </div>
          <div className="col-start-1">{formatEpoch(startEpoch)}</div>
          <div className="text-right">{formatEpoch(endEpoch)}</div>
        </div>
        {isExtensionConnected && (
          <div className="w-32 flex items-center justify-center">
            <ActionButton
              size="sm"
              borderRadius="sm"
              className="py-2"
              color="white"
              disabled={voteButtonDisabled}
              onClick={() =>
                navigate(GovernanceRoutes.submitVote(proposal.id).url)
              }
            >
              Vote
            </ActionButton>
          </div>
        )}
      </div>
    </>
  );
};
