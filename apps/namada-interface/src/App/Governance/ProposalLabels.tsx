import { InsetLabel, RoundedLabel } from "@namada/components";
import { assertNever } from "@namada/utils";
import { GoCheckCircleFill } from "react-icons/go";
import { ProposalStatus, ProposalType } from "slices/proposals";
import { twMerge } from "tailwind-merge";

export const StatusLabel: React.FC<
  {
    status: ProposalStatus;
  } & React.ComponentProps<typeof RoundedLabel>
> = ({ status, className, ...rest }) => {
  const [text, statusClassName] =
    status.status === "pending" ? ["Upcoming", "text-upcoming"]
    : status.status === "ongoing" ? ["Ongoing", "text-intermediate"]
    : status.status === "finished" ?
      status.passed ?
        ["Passed", "text-success"]
      : ["Rejected", "text-fail"]
    : assertNever(status);

  return (
    <RoundedLabel className={twMerge(className, statusClassName)} {...rest}>
      {text}
    </RoundedLabel>
  );
};

export const VotedLabel: React.FC<React.ComponentProps<"div">> = ({
  className,
  ...props
}) => {
  return (
    <RoundedLabel
      {...props}
      className={twMerge(
        "flex gap-1 text-cyan py-1 px-2 items-center",
        className
      )}
    >
      <div className="grow">Voted</div>
      <i className="inline-flex text-lg">
        <GoCheckCircleFill />
      </i>
    </RoundedLabel>
  );
};

export const TypeLabel: React.FC<
  {
    proposalType: ProposalType;
  } & React.ComponentProps<typeof InsetLabel>
> = ({ proposalType, ...rest }) => {
  const text =
    proposalType.type === "pgf_steward" ? "Steward proposal"
    : proposalType.type === "pgf_payment" ? "PGF proposal"
    : proposalType.type === "default" ? "Default"
    : assertNever(proposalType);

  return (
    <InsetLabel className="text-xs leading-[1.65em]" {...rest}>
      {text}
    </InsetLabel>
  );
};
