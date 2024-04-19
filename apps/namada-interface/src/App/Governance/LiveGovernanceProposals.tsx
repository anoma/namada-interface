import BigNumber from "bignumber.js";
import { GoInfo } from "react-icons/go";

import {
  ActionButton,
  InsetLabel,
  SegmentedBar,
  Stack,
} from "@namada/components";
import { Proposal } from "slices/proposals";
import { StatusLabel, VotedLabel } from "./ProposalLabels";
import { VoteType, colors, voteTypes } from "./types";

const ProposalListItem: React.FC<{
  proposal: Proposal;
  votes: Record<VoteType, BigNumber>;
  voted: boolean;
}> = ({ proposal, votes, voted }) => {
  const barData = voteTypes.map((voteType) => ({
    value: votes[voteType],
    color: colors[voteType],
  }));

  return (
    <Stack as="li" gap={4} className="rounded-sm bg-[#191919] p-4">
      <div className="flex items-center justify-between gap-4">
        <StatusLabel status="ongoing" className="w-58" />
        <div>Voting End on Dec 27th 18:55</div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div>#{proposal.id}</div>

        <div>Allocate 1% of supply to re-designing the end user interface</div>

        <InsetLabel color="dark">Community pool spend</InsetLabel>

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

      <SegmentedBar data={barData} />
    </Stack>
  );
};

export const LiveGovernanceProposals: React.FC = () => {
  const proposals: Proposal[] = [{ id: "123" }, { id: "456" }] as Proposal[];

  const votes: Record<VoteType, BigNumber> = {
    yes: BigNumber(1674.765),
    no: BigNumber(378.345),
    veto: BigNumber(200.213),
    abstain: BigNumber(1600.765),
  };

  return (
    <Stack gap={4} as="ul">
      {proposals.map((proposal, index) => (
        <ProposalListItem
          proposal={proposal}
          votes={votes}
          voted={index % 2 === 0}
          key={index}
        />
      ))}
    </Stack>
  );
};
