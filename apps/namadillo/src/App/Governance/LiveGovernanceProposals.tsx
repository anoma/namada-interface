import { SegmentedBar, Stack } from "@namada/components";
import { Proposal, VoteType, voteTypes } from "@namada/types";
import { routes } from "App/routes";
import BigNumber from "bignumber.js";
import clsx from "clsx";
import { GoInfo } from "react-icons/go";
import { generatePath, useNavigate } from "react-router-dom";
import { secondsToDateTimeString } from "utils";
import { StatusLabel, TypeLabel, VotedLabel } from "./ProposalLabels";
import { colors } from "./types";

const ProposalListItem: React.FC<{
  proposal: Proposal;
  vote?: VoteType;
}> = ({ proposal, vote }) => {
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
      onClick={() =>
        navigate(
          generatePath(routes.governanceProposal, {
            proposalId: proposal.id.toString(),
          })
        )
      }
      className={clsx(
        "group/proposal cursor-pointer",
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
        <div className="min-w-[6ch] text-sm">#{proposal.id.toString()}</div>
        <div className="flex-1 leading-tight">{proposal.content.title}</div>
        <TypeLabel proposalType={proposal.proposalType} color="dark" />
        <div className="min-w-20">
          {typeof vote !== "undefined" && (
            <VotedLabel vote={vote} className="text-[10px] w-fit m-auto" />
          )}
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
  proposals: Proposal[];
  votedProposals: { proposalId: bigint; vote: VoteType }[];
};

export const LiveGovernanceProposals: React.FC<
  LiveGovernanceProposalsProps
> = ({ proposals, votedProposals }) => {
  return (
    <div className="max-h-[490px] flex flex-col">
      <Stack
        gap={4}
        as="ul"
        className="dark-scrollbar overscroll-contain overflow-x-auto"
      >
        {proposals.map((proposal) => {
          const vote = votedProposals.find(
            (v) => v.proposalId === proposal.id
          )?.vote;
          return (
            <ProposalListItem
              proposal={proposal}
              vote={vote}
              key={proposal.id.toString()}
            />
          );
        })}
      </Stack>
    </div>
  );
};
