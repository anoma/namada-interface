import { Panel, SkeletonLoading } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { useAtomValue } from "jotai";

import { ProposalDiscord } from "App/Sidebars/ProposalDiscord";
import { proposalFamily, proposalVotedFamily } from "slices/proposals";
import { namadaExtensionConnectedAtom } from "slices/settings";
import {
  atomsAreFetching,
  atomsAreLoaded,
  useNotifyOnAtomError,
} from "store/utils";
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

  // TODO: is there a better way than this to show that voted is dependent on
  // isConnected?
  const extensionAtoms = isConnected ? [voted] : [];

  useNotifyOnAtomError(
    [proposal, ...extensionAtoms],
    [proposal.isError, voted.isError]
  );

  return (
    <div className="flex flex-col md:grid md:grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel className="px-3">
          {atomsAreFetching(proposal, ...extensionAtoms) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          <div className="px-12">
            {isConnected && atomsAreLoaded(proposal, ...extensionAtoms) && (
              <ProposalHeader
                proposal={proposal.data!}
                isExtensionConnected={true}
                voted={voted.data!}
              />
            )}
            {!isConnected && atomsAreLoaded(proposal) && (
              <ProposalHeader
                proposal={proposal.data!}
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
          {atomsAreFetching(proposal) && (
            <ProposalStatusSummary loading={true} />
          )}
          {atomsAreLoaded(proposal) && (
            <ProposalStatusSummary loading={false} proposal={proposal.data!} />
          )}
        </Panel>
        <ProposalDiscord />
      </aside>
    </div>
  );
};
