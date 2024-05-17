import { GoCheckCircleFill, GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import {
  Stack,
  StyledSelectBox,
  StyledTable,
  TableRow,
} from "@namada/components";
import { Proposal, ProposalWithExtraInfo } from "@namada/types";
import clsx from "clsx";
import { StatusLabel, TypeLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";

const key = (name: string, proposal?: Proposal): string => {
  const idPart = typeof proposal === "undefined" ? "" : `-${proposal.id}`;
  return `all-proposals-${name}${idPart}`;
};

type AllProposalsTableProps = (
  | { isExtensionConnected: true; votedProposalIds: bigint[] }
  | { isExtensionConnected: false }
) & {
  allProposals: ProposalWithExtraInfo[];
};

export const AllProposalsTable: React.FC<AllProposalsTableProps> = (props) => {
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
    { proposal, status }: ProposalWithExtraInfo,
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
        className="w-full text-center"
      />,

      // Status
      <StatusLabel
        key={key("status", proposal)}
        status={status}
        className="ml-auto"
      />,

      // Voted
      props.isExtensionConnected &&
        props.votedProposalIds.includes(proposal.id) && (
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
    <Stack gap={4}>
      <div className="flex gap-2 items-end">
        <TableSelect
          value="all"
          defaultValue="all"
          options={[
            {
              id: "all",
              value: <TableSelectOption>All</TableSelectOption>,
              ariaLabel: "",
            },
            {
              id: "default",
              value: <TableSelectOption>Default</TableSelectOption>,
              ariaLabel: "",
            },
            {
              id: "pgf_steward",
              value: <TableSelectOption>Pgf Steward</TableSelectOption>,
              ariaLabel: "",
            },
            {
              id: "pgf_payment",
              value: <TableSelectOption>PGF Payment</TableSelectOption>,
              ariaLabel: "",
            },
          ]}
          id="proposal-type-select"
          label="Proposal Type"
        />

        <TableSelect
          value="all"
          defaultValue="all"
          options={[
            {
              id: "all",
              value: <TableSelectOption>All</TableSelectOption>,
              ariaLabel: "",
            },
            {
              id: "upcoming",
              value: <TableSelectOption>Upcoming</TableSelectOption>,
              ariaLabel: "",
            },
            {
              id: "ongoing",
              value: <TableSelectOption>Ongoing</TableSelectOption>,
              ariaLabel: "",
            },
            {
              id: "passed",
              value: <TableSelectOption>Passed</TableSelectOption>,
              ariaLabel: "",
            },
            {
              id: "rejected",
              value: <TableSelectOption>Rejected</TableSelectOption>,
              ariaLabel: "",
            },
          ]}
          id="proposal-status-select"
          label="Proposal Status"
        />
      </div>

      <StyledTable
        tableProps={{ className: "w-full text-xs [&_td]:px-2 [&_th]:px-2" }}
        headProps={{ className: "text-xs" }}
        className=""
        id="all-proposals-table"
        headers={headers}
        rows={props.allProposals.map(renderRow)}
      />
    </Stack>
  );
};

const TableSelectOption: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <span className="col-span-full">{children}</span>;

const TableSelect: React.FC<
  Omit<
    React.ComponentProps<typeof StyledSelectBox>,
    "containerProps" | "listItemProps"
  > & { label: string }
> = (props) => (
  <div className="flex flex-col">
    <div className="text-xs text-[#8A8A8A] pl-5 pb-1">{props.label}</div>

    <StyledSelectBox
      containerProps={{
        className: clsx(
          "bg-[#1B1B1B] text-sm text-[#656565] rounded-md w-48 px-5 py-2",
          "border-r-[12px] border-transparent"
        ),
      }}
      listItemProps={{
        className: "w-32",
      }}
      {...props}
    />
  </div>
);
