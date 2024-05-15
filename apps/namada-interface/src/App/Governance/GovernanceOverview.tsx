import { Panel, SkeletonLoading } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { useAtomValue } from "jotai";
import { allProposalsWithExtraInfoAtom } from "slices/proposals";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { atomsAreFetching, atomsAreLoaded } from "store/utils";
import { AllProposalsTable } from "./AllProposalsTable";
import { LiveGovernanceProposals } from "./LiveGovernanceProposals";
import { ProposalsSummary } from "./ProposalsSummary";
import { UpcomingProposals } from "./UpcomingProposals";

export const GovernanceOverview: React.FC = () => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const allProposals = useAtomValue(allProposalsWithExtraInfoAtom);

  return (
    <PageWithSidebar>
      <div className="flex flex-col gap-1.5">
        {!isConnected && (
          <ConnectBanner text="To vote please connect your account" />
        )}
        <Panel title="Live Governance Proposals">
          {atomsAreFetching(allProposals) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(allProposals) && (
            <LiveGovernanceProposals allProposals={allProposals.data!} />
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
          {atomsAreFetching(allProposals) && (
            <SkeletonLoading height="150px" width="100%" />
          )}
          {atomsAreLoaded(allProposals) && (
            <AllProposalsTable allProposals={allProposals.data!} />
          )}
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
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
