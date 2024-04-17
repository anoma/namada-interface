import { GoCheckCircleFill, GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { twMerge } from "tailwind-merge";

import { StyledTable, TableRow } from "@namada/components";
import { assertNever } from "@namada/utils";
import { Proposal, ProposalStatus } from "slices/proposals";
import GovernanceRoutes from "./routes";

const key = (name: string, proposal?: Proposal): string => {
  const idPart = typeof proposal === "undefined" ? "" : `-${proposal.id}`;
  return `all-proposals-${name}${idPart}`;
};

const Label: React.FC<React.ComponentProps<"div">> = ({
  children,
  className,
  ...rest
}) => (
  <div
    className={twMerge(
      "uppercase rounded-2xl border-2 text-center px-2 py-0.5",
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

const StatusLabel: React.FC<{
  status: ProposalStatus;
}> = ({ status }) => {
  // TODO: colors don't work
  const [text, color] =
    status === "upcoming" ? ["Upcoming", "white"]
    : status === "ongoing" ? ["Ongoing", "white"]
    : status === "passed" ? ["Passed", "success"]
    : status === "rejected" ? ["Rejected", "fail"]
    : assertNever(status);

  return <Label className={`text-{color} ml-auto`}>{text}</Label>;
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

  const renderRow = (proposal: Proposal): TableRow => ({
    cells: [
      // ID
      `#${proposal.id}`,

      // Title
      "Allocate 1% of supply",

      // Type
      <div
        key={key("type", proposal)}
        className="bg-black rounded-lg w-fit px-4 py-2 text-neutral-450"
      >
        Community pool spend
      </div>,

      // Status
      <StatusLabel key={key("status", proposal)} status="passed" />,

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
      rows={([{ id: "862" }] as Proposal[]).map(renderRow)}
    />
  );
};
