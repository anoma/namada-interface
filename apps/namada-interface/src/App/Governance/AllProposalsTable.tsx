import { useAtomValue } from "jotai";
import { useState } from "react";
import { GoCheckCircleFill, GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";

import {
  Stack,
  StyledSelectBox,
  StyledTable,
  TableRow,
} from "@namada/components";
import { Proposal, isProposalStatus, proposalStatuses } from "@namada/types";
import { Search } from "App/Common/Search";
import clsx from "clsx";
import { allProposalsFamily } from "slices/proposals";
import { showProposalStatus, showProposalTypeString } from "utils";
import { StatusLabel, TypeLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";

const key = (name: string, proposal?: Proposal): string => {
  const idPart = typeof proposal === "undefined" ? "" : `-${proposal.id}`;
  return `all-proposals-${name}${idPart}`;
};

const Table: React.FC<
  {
    proposals: Proposal[];
  } & ExtensionConnectedProps
> = (props) => {
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

  const renderRow = (proposal: Proposal, index: number): TableRow => ({
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
        status={proposal.status}
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
    <div className="h-[490px] flex flex-col">
      <StyledTable
        tableProps={{ className: "w-full text-xs [&_td]:px-2 [&_th]:px-2" }}
        headProps={{ className: "text-xs" }}
        id="all-proposals-table"
        headers={headers}
        rows={props.proposals.map(renderRow)}
        containerClassName="dark-scrollbar"
      />
    </div>
  );
};

type ExtensionConnectedProps =
  | { isExtensionConnected: true; votedProposalIds: bigint[] }
  | { isExtensionConnected: false };

const statusFilters = [
  "all",
  "pending",
  "ongoing",
  "passed",
  "rejected",
] as const;
type StatusFilter = (typeof statusFilters)[number];

const isStatusFilter = (str: string): str is StatusFilter =>
  statusFilters.includes(str as StatusFilter);

const typeFilters = ["all", "default", "pgf_steward", "pgf_payment"] as const;
type TypeFilter = (typeof typeFilters)[number];

const isTypeFilter = (str: string): str is TypeFilter =>
  typeFilters.includes(str as TypeFilter);

export const AllProposalsTable: React.FC<ExtensionConnectedProps> = (props) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");

  const maybeStatus =
    isProposalStatus(selectedStatus) ? selectedStatus : undefined;
  const maybeType = selectedType === "all" ? undefined : selectedType;

  const proposals = useAtomValue(
    allProposalsFamily({
      status: maybeStatus,
      type: maybeType,
    })
  );

  return (
    <Stack gap={4}>
      <div className="flex gap-2 items-end">
        <TableSelect<StatusFilter>
          id="proposal-status-select"
          value={selectedStatus}
          defaultValue={selectedStatus}
          options={[
            {
              id: "all" as const,
              value: <TableSelectOption>All</TableSelectOption>,
              ariaLabel: "all",
            },
            ...proposalStatuses.map((status) => ({
              id: status,
              value: (
                <TableSelectOption>
                  {showProposalStatus(status)}
                </TableSelectOption>
              ),
              ariaLabel: status,
            })),
          ]}
          label="Proposal Status"
          onChange={(e) => {
            const value = e.target.value;
            if (!isStatusFilter(value)) {
              throw new Error(`unknown status filter value, got ${value}`);
            }
            setSelectedStatus(value);
          }}
        />

        <TableSelect<TypeFilter>
          value={selectedType}
          defaultValue={selectedType}
          options={[
            {
              id: "all",
              value: <TableSelectOption>All</TableSelectOption>,
              ariaLabel: "",
            },
            ...(["default", "pgf_steward", "pgf_payment"] as const).map(
              (type) => ({
                id: type,
                value: (
                  <TableSelectOption>
                    {showProposalTypeString(type)}
                  </TableSelectOption>
                ),
                ariaLabel: type,
              })
            ),
          ]}
          id="proposal-type-select"
          label="Proposal Type"
          onChange={(e) => {
            const value = e.target.value;
            if (!isTypeFilter(value)) {
              throw new Error(`unknown type filter value, got ${value}`);
            }
            setSelectedType(value);
          }}
        />

        <Search
          placeholder="Search by title or ID"
          className={clsx(
            "[&_input]:py-2 [&_input]:rounded-md [&_input]:border-[#5C5C5C]",
            "w-64 [&_input]:leading-normal [&_input]:h-9"
          )}
        />
      </div>

      <Table {...props} proposals={proposals.isSuccess ? proposals.data : []} />
    </Stack>
  );
};

const TableSelectOption: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <span className="col-span-full">{children}</span>;

type TableSelectProps<T extends string> = Omit<
  React.ComponentProps<typeof StyledSelectBox<T>>,
  "containerProps" | "listItemProps"
> & { label: string };

const TableSelect = <T extends string>(
  props: TableSelectProps<T>
): JSX.Element => (
  <div className="flex flex-col">
    <div className="text-xs text-[#8A8A8A] pl-5 pb-1">{props.label}</div>

    <StyledSelectBox<T>
      containerProps={{
        className: clsx(
          "bg-[#1B1B1B] text-sm text-[#656565] rounded-md w-48 px-5 py-2",
          "border-r-[12px] border-transparent h-9"
        ),
      }}
      listItemProps={{
        className: "w-32",
      }}
      {...props}
    />
  </div>
);
