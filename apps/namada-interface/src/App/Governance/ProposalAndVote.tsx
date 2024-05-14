import { Panel, SkeletonLoading } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { useAtomValue } from "jotai";

import {
  proposalFamily,
  proposalStatusFamily,
  proposalVotedFamily,
} from "slices/proposals";
import { atomsAreLoaded, atomsArePending } from "store/utils";
import { ProposalDescription } from "./ProposalDescription";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalStatusSummary } from "./ProposalStatusSummary";
import { VoteInfoCards } from "./VoteInfoCards";

export const ProposalAndVote: React.FC = () => {
  const { proposalId: proposalIdString = "" } = useSanitizedParams();

  // TODO: handle NaN case
  const proposalId = BigInt(Number.parseInt(proposalIdString));

  const proposal = useAtomValue(proposalFamily(proposalId));
  const voted = useAtomValue(proposalVotedFamily(proposalId));
  const status = useAtomValue(proposalStatusFamily(proposalId));

  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel className="px-10">
          {atomsArePending(proposal, voted, status) && (
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
          {atomsArePending(proposal) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(proposal) && (
            <ProposalDescription proposal={proposal.data!} />
          )}
        </Panel>
        <Panel className="py-6">
          {atomsArePending(proposal) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(proposal) && (
            <VoteInfoCards proposal={proposal.data!} />
          )}
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel title="Proposal Status">
          {atomsArePending(proposal, status) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(proposal, status) && (
            <ProposalStatusSummary
              proposal={proposal.data!}
              status={status.data!}
            />
          )}
        </Panel>
      </aside>
    </div>
  );
};
