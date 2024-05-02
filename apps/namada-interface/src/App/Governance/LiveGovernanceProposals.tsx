import { ActionButton, SegmentedBar, Stack } from "@namada/components";
import { useAtomValue } from "jotai";
import { GoInfo } from "react-icons/go";
import GovernanceRoutes from "./routes";

import clsx from "clsx";
import { useNavigate } from "react-router-dom";
import {
  Proposal,
  ProposalStatus,
  Votes,
  allProposalsWithExtraInfoAtom,
  voteTypes,
} from "slices/proposals";
import { StatusLabel, TypeLabel, VotedLabel } from "./ProposalLabels";
import { colors } from "./types";

const ProposalListItem: React.FC<{
  proposal: Proposal;
  status: ProposalStatus;
  voted: boolean;
  votes: Votes;
}> = ({ proposal, voted, votes }) => {
  const navigate = useNavigate();

  const barData = voteTypes.map((voteType) => ({
    value: votes[voteType],
    color: colors[voteType],
  }));

  const onVote = (e: React.MouseEvent): void => {
    e.stopPropagation();
  };

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
        <StatusLabel
          className="text-[10px] min-w-38"
          status={{ status: "ongoing" }}
        />
        <div className="text-xs text-neutral-400">
          Voting End on epoch {proposal.endEpoch.toString()}
        </div>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-[6ch]">#{proposal.id.toString()}</div>
        <div className="flex-1">{proposal.content.title}</div>
        <TypeLabel proposalType={proposal.proposalType} color="dark" />
        <div>
          {voted ?
            <VotedLabel className="text-[10px]" />
          : <ActionButton
              className="uppercase py-1.5"
              size="xs"
              color="white"
              borderRadius="sm"
              onClick={onVote}
            >
              Vote
            </ActionButton>
          }
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

      {barData && <SegmentedBar data={barData} />}
    </Stack>
  );
};

export const LiveGovernanceProposals: React.FC = () => {
  const allProposals = useAtomValue(allProposalsWithExtraInfoAtom);

  if (!allProposals.isSuccess) {
    return <h1>OH NO</h1>;
  }

  const liveProposals = allProposals.data.filter(
    (proposal) => proposal.status.status === "ongoing"
  );

  return (
    <Stack gap={4} as="ul">
      {liveProposals.map(({ proposal, status, voted, votes }, index) => (
        <ProposalListItem
          proposal={proposal}
          status={status}
          voted={voted}
          votes={votes}
          key={index}
        />
      ))}
    </Stack>
  );
};
