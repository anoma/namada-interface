import { InsetLabel, RoundedLabel } from "@namada/components";
import { ProposalStatus, ProposalType, VoteType } from "@namada/types";
import { assertNever } from "@namada/utils";
import { GoCheckCircleFill, GoSkipFill, GoXCircleFill } from "react-icons/go";
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

type VotedLabelProps = {
  vote: VoteType;
} & React.ComponentProps<"div">;

export const VotedLabel: React.FC<VotedLabelProps> = ({
  vote,
  className,
  ...props
}) => {
  const { icon, label, color } =
    vote === "yay" ?
      { icon: <GoCheckCircleFill />, label: "yes", color: "text-yay" }
    : vote === "nay" ?
      { icon: <GoXCircleFill />, label: "no", color: "text-nay" }
    : vote === "abstain" ?
      {
        icon: <GoSkipFill className="rotate-45" />,
        label: "abstain",
        color: "text-abstain",
      }
    : assertNever(vote);

  return (
    <RoundedLabel
      {...props}
      className={twMerge("flex gap-1 py-1 px-2 items-center", color, className)}
    >
      <div className="grow">Voted {label}</div>
      <i className="inline-flex text-lg">{icon}</i>
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
