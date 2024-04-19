import { GoCheckCircleFill, GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import { InsetLabel, StyledTable, TableRow } from "@namada/components";
import { Proposal } from "slices/proposals";
import { StatusLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";

const key = (name: string, proposal?: Proposal): string => {
  const idPart = typeof proposal === "undefined" ? "" : `-${proposal.id}`;
  return `all-proposals-${name}${idPart}`;
};

export const AllProposalsTable: React.FC = () => {
  const navigate = useNavigate();

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
      "Allocate 1% of supply",

      // Type
      <InsetLabel
        key={key("type", proposal)}
        color={index % 2 === 0 ? "dark" : "light"}
      >
        Community pool spend
      </InsetLabel>,

      // Status
      <StatusLabel
        key={key("status", proposal)}
        status="passed"
        className="ml-auto"
      />,

      // TODO: what is this?
      <GoCheckCircleFill key={key("check", proposal)} className="text-cyan" />,

      // Voting end on
      <div key={key("voting-end", proposal)} className="text-right">
        Something something
      </div>,

      // Info
      <GoInfo
        key={key("info", proposal)}
        onClick={() => navigate(GovernanceRoutes.proposal(proposal.id).url)}
      />,
    ],
  });

  return (
    <StyledTable
      tableProps={{ className: "w-full" }}
      id="all-proposals-table"
      headers={headers}
      rows={(
        [
          { id: "862" },
          { id: "369" },
          { id: "123" },
          { id: "444" },
        ] as Proposal[]
      ).map(renderRow)}
    />
  );
};
