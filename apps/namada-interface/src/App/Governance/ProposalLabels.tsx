import { GoCheckCircleFill } from "react-icons/go";

import { RoundedLabel } from "@namada/components";
import { assertNever } from "@namada/utils";
import { ProposalStatus } from "slices/proposals";

export const StatusLabel: React.FC<
  {
    status: ProposalStatus;
  } & React.ComponentProps<typeof RoundedLabel>
> = ({ status, style, ...rest }) => {
  const [text, color] =
    status === "upcoming" ? ["Upcoming", "#7DA0A8"]
    : status === "ongoing" ? ["Ongoing", "#FF8A00"]
    : status === "passed" ? ["Passed", "#15DD89"]
    : status === "rejected" ? ["Rejected", "#DD1539"]
    : assertNever(status);

  return (
    <RoundedLabel style={{ ...style, color }} {...rest}>
      {text}
    </RoundedLabel>
  );
};

export const VotedLabel: React.FC = () => (
  <RoundedLabel className="text-cyan flex items-center w-28">
    <div className="grow">Voted</div>
    <GoCheckCircleFill />
  </RoundedLabel>
);
