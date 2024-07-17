import { InsetLabel, RoundedLabel } from "@namada/components";
import { ProposalStatus, ProposalType } from "@namada/types";
import { assertNever } from "@namada/utils";
import { GoCheckCircleFill } from "react-icons/go";
import { twMerge } from "tailwind-merge";
import { proposalStatusToString, proposalTypeStringToString } from "utils";

export const StatusLabel: React.FC<
  {
    status: ProposalStatus;
  } & React.ComponentProps<typeof RoundedLabel>
> = ({ status, className, ...rest }) => {
  const statusClassName =
    status === "pending" ? "text-upcoming"
    : status === "ongoing" ? "text-intermediate"
    : status === "passed" ? "text-success"
    : status === "rejected" ? "text-fail"
    : assertNever(status);

  return (
    <RoundedLabel className={twMerge(className, statusClassName)} {...rest}>
      {proposalStatusToString(status)}
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
> = ({ proposalType, ...rest }) => (
  <InsetLabel className="text-xs leading-[1.65em]" {...rest}>
    {proposalTypeStringToString(proposalType.type)}
  </InsetLabel>
);
