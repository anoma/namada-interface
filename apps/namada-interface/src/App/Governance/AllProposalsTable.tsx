import { useAtomValue } from "jotai";
import { GoCheckCircleFill, GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import { StyledTable, TableRow } from "@namada/components";
import {
  ProposalWithVotingInfo,
  _Proposal,
  proposalStatuses,
  proposalsGroupedByStatusAtom,
  votedProposalsAtom,
} from "slices/proposals";
import { StatusLabel, TypeLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";

const key = (name: string, proposal?: _Proposal): string => {
  const idPart = typeof proposal === "undefined" ? "" : `-${proposal.id}`;
  return `all-proposals-${name}${idPart}`;
};

export const AllProposalsTable: React.FC = () => {
  const groupedProposals = useAtomValue(proposalsGroupedByStatusAtom);
  const votedProposals = useAtomValue(votedProposalsAtom);

  const proposalList: ProposalWithVotingInfo[] = proposalStatuses.flatMap(
    (status) =>
      groupedProposals[status].map((proposal) => ({
        ...proposal,
        status,
        voted: votedProposals.includes(proposal.id),
      }))
  );

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

  const renderRow = (
    proposal: ProposalWithVotingInfo,
    index: number
  ): TableRow => ({
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
        status={proposal.status}
        className="ml-auto"
      />,

      // Voted
      proposal.voted ?
        <GoCheckCircleFill key={key("check", proposal)} className="text-cyan" />
      : null,

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

  return (
    <StyledTable
      tableProps={{ className: "w-full" }}
      id="all-proposals-table"
      headers={headers}
      rows={proposalList.map(renderRow)}
    />
  );
};
