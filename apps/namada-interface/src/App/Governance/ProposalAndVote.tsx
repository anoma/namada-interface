import { Panel, SkeletonLoading } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { useAtomValue } from "jotai";

import { ProposalDiscord } from "App/Sidebars/ProposalDiscord";
import {
  proposalFamily,
  proposalStatusFamily,
  proposalVotedFamily,
} from "slices/proposals";
import { namadaExtensionConnectedAtom } from "slices/settings";
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

  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const proposal = useAtomValue(proposalFamily(proposalId));
  const voted = useAtomValue(proposalVotedFamily(proposalId));
  const status = useAtomValue(proposalStatusFamily(proposalId));

  // TODO: is there a better way than this to show that voted is dependent on
  // isConnected?
  const extensionAtoms = isConnected ? [voted] : [];

  return (
    <div className="flex flex-col md:grid md:grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel className="px-3">
          {atomsAreFetching(proposal, status, ...extensionAtoms) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          <div className="px-12">
            {isConnected &&
              atomsAreLoaded(proposal, status, ...extensionAtoms) && (
                <ProposalHeader
                  proposal={proposal.data!}
                  status={status.data!}
                  isExtensionConnected={true}
                  voted={voted.data!}
                />
              )}
            {!isConnected && atomsAreLoaded(proposal, status) && (
              <ProposalHeader
                proposal={proposal.data!}
                status={status.data!}
                isExtensionConnected={false}
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
            <ProposalStatusSummary loading={true} />
          )}
          {atomsAreLoaded(proposal, status) && (
            <ProposalStatusSummary
              loading={false}
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
