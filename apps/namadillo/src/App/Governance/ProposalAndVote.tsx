import { Panel } from "@namada/components";
import { useAtomValue } from "jotai";

import { ProposalDiscord } from "App/Sidebars/ProposalDiscord";
import { useProposalIdParam } from "hooks";
import { proposalFamily, proposalVotedFamily } from "slices/proposals";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { useNotifyOnAtomError } from "store/utils";
import { ProposalDescription } from "./ProposalDescription";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalStatusSummary } from "./ProposalStatusSummary";
import { VoteHelpText } from "./VoteHelpText";
import { VoteInfoCards } from "./VoteInfoCards";

export const ProposalAndVote: React.FC = () => {
  const proposalId = useProposalIdParam();

  return proposalId === null ? null : (
      <WithProposalId proposalId={proposalId} />
    );
};

export const WithProposalId: React.FC<{ proposalId: bigint }> = ({
  proposalId,
}) => {
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
          <div className="px-12">
            <ProposalHeader proposalId={proposalId} />
          </div>
        </Panel>
        <Panel title="Description">
          <ProposalDescription proposalId={proposalId} />
        </Panel>
        <Panel className="py-6 px-7">
          <VoteInfoCards proposalId={proposalId} />
        </Panel>
        <Panel className="py-6">
          <VoteHelpText />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel className="@container" title="Proposal Status">
          <ProposalStatusSummary proposalId={proposalId} />
        </Panel>
        <ProposalDiscord />
      </aside>
    </div>
  );
};
