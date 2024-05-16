import { Panel, SkeletonLoading } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { useAtomValue } from "jotai";

import { ProposalDiscord } from "App/Sidebars/ProposalDiscord";
import {
  proposalFamily,
  proposalStatusFamily,
  proposalVotedFamily,
} from "slices/proposals";
import { atomsAreFetching, atomsAreLoaded } from "store/utils";
import { ProposalDescription } from "./ProposalDescription";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalStatusSummary } from "./ProposalStatusSummary";
import { VoteHelpText } from "./VoteHelpText";
import { VoteInfoCards } from "./VoteInfoCards";

export const ProposalAndVote: React.FC = () => {
  const { proposalId: proposalIdString = "" } = useSanitizedParams();

  // TODO: handle NaN case
  const proposalId = BigInt(Number.parseInt(proposalIdString));

  const proposal = useAtomValue(proposalFamily(proposalId));
  const voted = useAtomValue(proposalVotedFamily(proposalId));
  const status = useAtomValue(proposalStatusFamily(proposalId));

  return (
    <div className="flex flex-col md:grid md:grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel className="px-3">
          {atomsAreFetching(proposal, voted, status) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          <div className="px-12">
            {atomsAreLoaded(proposal, voted, status) && (
              <ProposalHeader
                proposal={proposal.data!}
                voted={voted.data!}
                status={status.data!}
              />
            )}
          </div>
        </Panel>
        <Panel title="Description">
          {atomsAreFetching(proposal) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(proposal) && (
            <ProposalDescription proposal={proposal.data!} />
          )}
        </Panel>
        <Panel className="py-6 px-7">
          {atomsAreFetching(proposal) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(proposal) && (
            <VoteInfoCards proposal={proposal.data!} />
          )}
        </Panel>
        <Panel className="py-6">
          <VoteHelpText />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel className="@container" title="Proposal Status">
          {atomsAreFetching(proposal, status) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(proposal, status) && (
            <ProposalStatusSummary
              proposal={proposal.data!}
              status={status.data!}
            />
          )}
        </Panel>
        <ProposalDiscord />
      </aside>
    </div>
  );
};
