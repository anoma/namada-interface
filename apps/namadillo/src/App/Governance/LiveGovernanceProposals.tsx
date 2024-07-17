import { SegmentedBar, Stack } from "@namada/components";
import { Proposal, voteTypes } from "@namada/types";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { GoInfo } from "react-icons/go";
import { useNavigate } from "react-router-dom";
import { secondsToDateTimeString } from "utils";
import { StatusLabel, TypeLabel, VotedLabel } from "./ProposalLabels";
import GovernanceRoutes from "./routes";
import { colors } from "./types";

const ProposalListItem: React.FC<{
  proposal: Proposal;
  voted: boolean;
}> = ({ proposal, voted }) => {
  const { status } = proposal;

  const navigate = useNavigate();

  const zeroVotes = BigNumber.sum(
    ...voteTypes.map((voteType) => proposal[voteType])
  ).isEqualTo(0);

  const barData =
    zeroVotes ?
      [{ value: 1, color: "#3A3A3A" }]
    : voteTypes.map((voteType) => ({
        value: proposal[voteType],
        color: colors[voteType],
      }));

  return (
    <Stack
      as="li"
      gap={3}
      onClick={() => navigate(GovernanceRoutes.proposal(proposal.id).url)}
      className={clsx(
        "group/proposal cursor-pointer text-sm",
        "rounded-md bg-[#191919] p-4"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <StatusLabel className="text-[10px] min-w-38" status={status} />
        <div className="text-xs text-neutral-400">
          Voting End on {secondsToDateTimeString(proposal.endTime)}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-[6ch]">#{proposal.id.toString()}</div>
        <div className="flex-1">{proposal.content.title}</div>
        <TypeLabel proposalType={proposal.proposalType} color="dark" />
        <div className="min-w-20">
          {voted && <VotedLabel className="text-[10px] w-fit m-auto" />}
        </div>
        <i
          className={clsx(
            "flex justify-center w-10 text-md text-center",
            "group-hover/proposal:text-cyan"
          )}
        >
          <GoInfo />
        </i>
      </div>

      <SegmentedBar data={barData} />
    </Stack>
  );
};

type LiveGovernanceProposalsProps = {
  votedProposalIds: bigint[];
} & {
  proposals: Proposal[];
};

export const LiveGovernanceProposals: React.FC<
  LiveGovernanceProposalsProps
> = ({ proposals, votedProposalIds }) => {
  return (
    <div className="max-h-[490px] flex flex-col">
      <Stack
        gap={4}
        as="ul"
        className="dark-scrollbar overscroll-contain overflow-x-auto"
      >
        {proposals.map((proposal) => {
          const voted = votedProposalIds.includes(proposal.id);
          return (
            <ProposalListItem
              proposal={proposal}
              voted={voted}
              key={proposal.id.toString()}
            />
          );
        })}
      </Stack>
    </div>
  );
};
