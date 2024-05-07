import { GoCheckCircleFill, GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import { StyledTable, TableRow } from "@namada/components";
import { Proposal, ProposalWithExtraInfo } from "@namada/types";
import clsx from "clsx";
import { StatusLabel, TypeLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";

const key = (name: string, proposal?: Proposal): string => {
  const idPart = typeof proposal === "undefined" ? "" : `-${proposal.id}`;
  return `all-proposals-${name}${idPart}`;
};

export const AllProposalsTable: React.FC<{
  allProposals: ProposalWithExtraInfo[];
}> = ({ allProposals }) => {
  const navigate = useNavigate();

  const headers = [
    "ID",
    "Title",
    "Type",
    "Status",
    "",
    { children: "Voting end on UTC", className: "text-right" },
    "",
  ];

  const renderRow = (
    { proposal, status, voted }: ProposalWithExtraInfo,
    index: number
  ): TableRow => ({
    className: clsx(
      "group/proposals cursor-pointer text-xs [&_td]:py-4",
      "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md"
    ),
    onClick: () => {
      navigate(GovernanceRoutes.proposal(proposal.id).url);
    },
    cells: [
      // ID
      <div key={key("id", proposal)} className="pl-3 flex">
        #{proposal.id.toString()}
      </div>,

      // Title
      proposal.content.title,

      // Type
      <TypeLabel
        key={key("type", proposal)}
        color={index % 2 === 0 ? "dark" : "light"}
        proposalType={proposal.proposalType}
      />,

      // Status
      <StatusLabel
        key={key("status", proposal)}
        status={status}
        className="ml-auto"
      />,

      // Voted
      voted && (
        <GoCheckCircleFill
          key={key("check", proposal)}
          className="text-cyan text-lg"
        />
      ),

      // Voting end on
      <div key={key("voting-end", proposal)} className="text-right">
        Epoch {proposal.endEpoch.toString()}
      </div>,

      // Info
      <i
        key={key("info", proposal)}
        className="flex justify-center w-6 text-lg group-hover/proposals:text-cyan"
      >
        <GoInfo key={key("info", proposal)} />
      </i>,
    ],
  });

  return (
    <StyledTable
      tableProps={{ className: "w-full text-xs [&_td]:px-2 [&_th]:px-2" }}
      headProps={{ className: "text-xs" }}
      className=""
      id="all-proposals-table"
      headers={headers}
      rows={allProposals.map(renderRow)}
    />
  );
};
