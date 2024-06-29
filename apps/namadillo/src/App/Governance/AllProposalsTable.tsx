import { Stack, StyledSelectBox, TableRow } from "@namada/components";
import { Proposal, isProposalStatus, proposalStatuses } from "@namada/types";
import { Search } from "App/Common/Search";
import { TableWithPaginator } from "App/Common/TableWithPaginator";
import { allProposalsFamily } from "atoms/proposals";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import { useState } from "react";
import { GoCheckCircleFill, GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { showProposalStatus, showProposalTypeString } from "utils";
import { StatusLabel, TypeLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";

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
    {
      children: "Voting end on UTC",
      className: "text-right whitespace-nowrap rtl-grid",
      dir: "rtl",
    },
    "",
  ];

  const renderRow = (proposal: Proposal, index: number): TableRow => ({
    key: proposal.id.toString(),
    className: clsx(
      "group/proposals cursor-pointer text-xs [&_td]:py-4",
      "[&_td:first-child]:rounded-s-md [&_td:last-child]:rounded-e-md"
    ),
    onClick: () => {
      navigate(GovernanceRoutes.proposal(proposal.id).url);
    },
    cells: [
      // ID
      <div key="id" className="pl-3 flex">
        #{proposal.id.toString()}
      </div>,

      // Title
      <Title key="title" proposal={proposal} />,

      // Type
      <Type key="type" proposal={proposal} index={index} />,

      // Status
      <Status key="status" proposal={proposal} />,

      // Voted
      props.votedProposalIds.includes(proposal.id) && (
        <GoCheckCircleFill key="voted" className="text-cyan text-lg" />
      ),

      // Voting end on
      <VotingEnd key="voting-end" proposal={proposal} />,

      // Info
      <i
        key="info"
        className="flex justify-center w-6 text-lg group-hover/proposals:text-cyan"
      >
        <GoInfo />
      </i>,
    ],
  });

  return (
    <TableWithPaginator
      id="all-proposals-table"
      headers={headers}
      itemList={props.proposals}
      renderRow={renderRow}
      tableProps={{
        className: clsx(
          "w-full text-xs [&_td]:px-2 [&_th]:px-2 table-fixed",
          "[&_th:nth-child(1)]:w-[10%]", // ID
          "[&_th:nth-child(3)]:w-[20%]", // Type
          "[&_th:nth-child(4)]:w-[15%]", // Status
          "[&_th:nth-child(5)]:w-[5%]", // Voted
          "[&_th:nth-child(6)]:w-[10%]", // Voting End
          "[&_th:nth-child(7)]:w-[5%]" // Info button
        ),
      }}
      headProps={{ className: "text-xs" }}
      resultsPerPage={50}
    />
  );
};

type ExtensionConnectedProps = { votedProposalIds: bigint[] };

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

const typeFilters = [
  "all",
  "default",
  "default_with_wasm",
  "pgf_steward",
  "pgf_payment",
] as const;
type TypeFilter = (typeof typeFilters)[number];

const isTypeFilter = (str: string): str is TypeFilter =>
  typeFilters.includes(str as TypeFilter);

export const AllProposalsTable: React.FC<ExtensionConnectedProps> = (props) => {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedType, setSelectedType] = useState<TypeFilter>("all");
  const [search, setSearch] = useState<string | undefined>();

  const maybeStatus =
    isProposalStatus(selectedStatus) ? selectedStatus : undefined;
  const maybeType = selectedType === "all" ? undefined : selectedType;

  // TODO: just query IDs, don't query full proposals.
  // This should be better for loading table rows in parallel.
  const proposals = useAtomValue(
    allProposalsFamily({
      status: maybeStatus,
      type: maybeType,
      search,
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
            ...(
              [
                "default",
                "default_with_wasm",
                "pgf_steward",
                "pgf_payment",
              ] as const
            ).map((type) => ({
              id: type,
              value: (
                <TableSelectOption>
                  {showProposalTypeString(type)}
                </TableSelectOption>
              ),
              ariaLabel: type,
            })),
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
          onChange={setSearch}
        />
      </div>

      <div className="h-[490px] flex flex-col">
        {proposals.status === "error" || proposals.status === "pending" ? null
        : <Table {...props} proposals={proposals.data || []} />}
      </div>
    </Stack>
  );
};

const TableSelectOption: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => <span className="col-span-full w-fit">{children}</span>;

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
        className: "min-w-32",
      }}
      {...props}
    />
  </div>
);

type CellProps = { proposal: Proposal };

const Title: React.FC<CellProps> = ({ proposal }) => (
  <div className="w-full overflow-x-hidden whitespace-nowrap text-ellipsis">
    {proposal.content.title}
  </div>
);

const Type: React.FC<{ index: number } & CellProps> = ({ proposal, index }) => (
  <TypeLabel
    color={index % 2 === 0 ? "dark" : "light"}
    proposalType={proposal.proposalType}
    className="w-full text-center"
  />
);

const Status: React.FC<CellProps> = ({ proposal }) => (
  <StatusLabel status={proposal.status} className="ml-auto" />
);

const VotingEnd: React.FC<CellProps> = ({ proposal }) => (
  <div className="text-right">Epoch {proposal.endEpoch.toString()}</div>
);
