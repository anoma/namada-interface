import { useAtomValue } from "jotai";
import { GoInfo } from "react-icons/go";

import { ActionButton, SegmentedBar, Stack } from "@namada/components";
import { mapUndefined } from "@namada/utils";

import {
  _Proposal,
  liveProposalsAtom,
  votedProposalsAtom,
  votesAtom,
  voteTypes,
} from "slices/proposals";
import { StatusLabel, TypeLabel, VotedLabel } from "./ProposalLabels";
import { colors } from "./types";

const ProposalListItem: React.FC<{
  proposal: _Proposal;
}> = ({ proposal }) => {
  const votedProposals = useAtomValue(votedProposalsAtom);
  const voted = votedProposals.includes(proposal.id);

  const { [proposal.id]: maybeVotes } = useAtomValue(votesAtom);

  const barData = mapUndefined(
    (votes) =>
      voteTypes.map((voteType) => ({
        value: votes[voteType],
        color: colors[voteType],
      })),
    maybeVotes
  );

  return (
    <Stack as="li" gap={4} className="rounded-sm bg-[#191919] p-4">
      <div className="flex items-center justify-between gap-4">
        <StatusLabel status="ongoing" className="w-58" />
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
  const proposals = useAtomValue(liveProposalsAtom);

  return (
    <Stack gap={4} as="ul">
      {proposals.map((proposal, index) => (
        <ProposalListItem proposal={proposal} key={index} />
      ))}
    </Stack>
  );
};
