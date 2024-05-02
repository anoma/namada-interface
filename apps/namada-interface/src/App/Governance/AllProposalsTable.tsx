import { useAtomValue } from "jotai";
import { GoCheckCircleFill, GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import { StyledTable, TableRow } from "@namada/components";
import { Proposal, allProposalsAtom } from "slices/proposals";
import { StatusLabel, TypeLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";

const key = (name: string, proposal?: Proposal): string => {
  const idPart = typeof proposal === "undefined" ? "" : `-${proposal.id}`;
  return `all-proposals-${name}${idPart}`;
};

export const AllProposalsTable: React.FC = () => {
  const navigate = useNavigate();

  const allProposals = useAtomValue(allProposalsAtom);

  const headers = [
    "ID",
    "Title",
    "Type",
    <div key={key("status")} className="text-right">
      Status
    </div>,
    "",
    <div key={key("voting-end")} className="text-right">
      Voting end on UTC
    </div>,
    "",
  ];

  const renderRow = (proposal: Proposal, index: number): TableRow => ({
    cells: [
      // ID
      `#${proposal.id}`,

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
        status={{ status: "ongoing" }}
        className="ml-auto"
      />,

      // Voted
      <GoCheckCircleFill key={key("check", proposal)} className="text-cyan" />,

      // Voting end on
      <div key={key("voting-end", proposal)} className="text-right">
        Epoch {proposal.endEpoch.toString()}
      </div>,

      // Info
      <GoInfo
        key={key("info", proposal)}
        onClick={() => navigate(GovernanceRoutes.proposal(proposal.id).url)}
      />,
    ],
  });

  if (!allProposals.isSuccess) {
    return <h1>OH NO</h1>;
  }

  return (
    <StyledTable
      tableProps={{ className: "w-full" }}
      id="all-proposals-table"
      headers={headers}
      rows={allProposals.data.map(renderRow)}
    />
  );
};
