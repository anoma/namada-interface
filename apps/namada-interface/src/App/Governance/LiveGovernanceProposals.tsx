import { useAtomValue } from "jotai";
import { GoInfo } from "react-icons/go";

import { ActionButton, SegmentedBar, Stack } from "@namada/components";

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
}> = ({ proposal, status, voted, votes }) => {
  const barData = voteTypes.map((voteType) => ({
    value: votes[voteType],
    color: colors[voteType],
  }));

  return (
    <Stack as="li" gap={4} className="rounded-sm bg-[#191919] p-4">
      <div className="flex items-center justify-between gap-4">
        <StatusLabel status={{ status: "ongoing" }} className="w-58" />
        <div>Voting End on epoch {proposal.endEpoch.toString()}</div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>#{proposal.id.toString()}</div>

        <div>{proposal.content.title}</div>

        <TypeLabel proposalType={proposal.proposalType} color="dark" />

        {voted ?
          <VotedLabel />
        : <ActionButton
            className="w-32 uppercase"
            color="white"
            borderRadius="sm"
          >
            Vote
          </ActionButton>
        }

        <GoInfo />
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
