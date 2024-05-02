import { Panel, SkeletonLoading } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";

import {
  proposalFamily,
  proposalStatusFamily,
  proposalVotedFamily,
  proposalVotesFamily,
} from "slices/proposals";
import { atomsAreFetching, atomsAreLoaded } from "store/utils";
import { ProposalDescription } from "./ProposalDescription";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalStatusSummary } from "./ProposalStatusSummary";
import { VoteBreakdown } from "./VoteBreakdown";
import { VoteInfoCards } from "./VoteInfoCards";

export const ProposalAndVote: React.FC = () => {
  const { proposalId: proposalIdString = "" } = useSanitizedParams();
  const proposalId = Number.parseInt(proposalIdString);
  const proposal = useAtomValue(proposalFamily(proposalId));
  const votes = useAtomValue(proposalVotesFamily(proposalId));
  const voted = useAtomValue(proposalVotedFamily(proposalId));
  const status = useAtomValue(proposalStatusFamily(proposalId));

  // TODO: I think we're going to have a problem with this for ongoing proposals
  // because Namada seems to use the voting power in the end epoch to determine
  // whether the vote has passed, but while it's ongoing we have no idea what
  // that voting power will be.
  const totalVotingPower = BigNumber(4_000);

  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel className="px-10">
          {atomsAreFetching(proposal, voted, status) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(proposal, voted, status) && (
            <ProposalHeader
              proposal={proposal.data!}
              voted={voted.data!}
              status={status.data!}
            />
          )}
        </Panel>
        <Panel title="Description">
          {proposal.isSuccess && (
            <ProposalDescription proposal={proposal.data} />
          )}
        </Panel>
        <Panel className="py-6">
          {proposal.isSuccess && <VoteInfoCards proposal={proposal.data} />}
        </Panel>
        <Panel className="px-10">
          {atomsAreLoaded(proposal, votes) && (
            <VoteBreakdown
              votes={votes.data!}
              totalVotingPower={totalVotingPower}
            />
          )}
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel title="Proposal Status">
          {atomsAreLoaded(proposal, votes) && (
            <ProposalStatusSummary
              proposal={proposal.data!}
              votes={votes.data!}
            />
          )}
        </Panel>
      </aside>
    </div>
  );
};
