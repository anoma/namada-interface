import { Panel, SkeletonLoading } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { useAtomValue } from "jotai";
import {
  allProposalsWithExtraInfoAtom,
  votedProposalIdsAtom,
} from "slices/proposals";
import { namadaExtensionConnectedAtom } from "slices/settings";
import {
  atomsAreFetching,
  atomsAreLoaded,
  useNotifyOnAtomError,
} from "store/utils";
import { AllProposalsTable } from "./AllProposalsTable";
import { LiveGovernanceProposals } from "./LiveGovernanceProposals";
import { ProposalsSummary } from "./ProposalsSummary";
import { UpcomingProposals } from "./UpcomingProposals";

export const GovernanceOverview: React.FC = () => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const allProposals = useAtomValue(allProposalsWithExtraInfoAtom);
  const votedProposalIds = useAtomValue(votedProposalIdsAtom);

  // TODO: is there a better way than this to show that votedProposalIdsAtom
  // is dependent on isConnected?
  const extensionAtoms = isConnected ? [votedProposalIds] : [];

  useNotifyOnAtomError(
    [allProposals, ...extensionAtoms],
    [allProposals.isError, votedProposalIds.isError]
  );

  return (
    <PageWithSidebar>
      <div className="flex flex-col gap-1.5">
        {!isConnected && (
          <ConnectBanner text="To vote please connect your account" />
        )}
        <Panel title="Live Governance Proposals">
          {atomsAreFetching(allProposals, ...extensionAtoms) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {isConnected && atomsAreLoaded(allProposals, ...extensionAtoms) && (
            <LiveGovernanceProposals
              allProposals={allProposals.data!}
              isExtensionConnected={true}
              votedProposalIds={votedProposalIds.data!}
            />
          )}
          {!isConnected && atomsAreLoaded(allProposals) && (
            <LiveGovernanceProposals
              allProposals={allProposals.data!}
              isExtensionConnected={false}
            />
          )}
        </Panel>
        <Panel title="Upcoming Proposals">
          {atomsAreFetching(allProposals) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(allProposals) && (
            <UpcomingProposals allProposals={allProposals.data!} />
          )}
        </Panel>
        <Panel title="All Proposals">
          {atomsAreFetching(allProposals, ...extensionAtoms) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {isConnected && atomsAreLoaded(allProposals, ...extensionAtoms) && (
            <AllProposalsTable
              allProposals={allProposals.data!}
              isExtensionConnected={true}
              votedProposalIds={votedProposalIds.data!}
            />
          )}
          {!isConnected && atomsAreLoaded(allProposals) && (
            <AllProposalsTable
              allProposals={allProposals.data!}
              isExtensionConnected={false}
            />
          )}
        </Panel>
      </div>
      <aside className="flex flex-col gap-2 mt-1.5 lg:mt-0">
        <Panel>
          {atomsAreFetching(allProposals) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(allProposals) && (
            <ProposalsSummary allProposals={allProposals.data!} />
          )}
        </Panel>
      </aside>
    </PageWithSidebar>
  );
};
