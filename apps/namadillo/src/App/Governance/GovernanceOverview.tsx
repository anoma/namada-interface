import { Panel, SkeletonLoading } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { allProposalsAtom, votedProposalIdsAtom } from "atoms/proposals";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import {
  atomsAreFetching,
  atomsAreLoaded,
  useNotifyOnAtomError,
} from "atoms/utils";
import { useAtomValue } from "jotai";
import { AllProposalsTable } from "./AllProposalsTable";
import { LiveGovernanceProposals } from "./LiveGovernanceProposals";
import { ProposalListPanel } from "./ProposalListPanel";
import { ProposalsSummary } from "./ProposalsSummary";
import { UpcomingProposals } from "./UpcomingProposals";

export const GovernanceOverview: React.FC = () => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);
  const allProposals = useAtomValue(allProposalsAtom);
  const votedProposalIds = useAtomValue(votedProposalIdsAtom);

  // TODO: is there a better way than this to show that votedProposalIdsAtom
  // is dependent on isConnected?
  const extensionAtoms = isConnected ? [votedProposalIds] : [];
  const activeAtoms = [allProposals, ...extensionAtoms];

  const liveProposals =
    allProposals.data?.filter((proposal) => proposal.status === "ongoing") ||
    [];

  const upcomingProposals =
    allProposals.data?.filter((proposal) => proposal.status === "pending") ||
    [];

  useNotifyOnAtomError(activeAtoms, [
    allProposals.isError,
    votedProposalIds.isError,
  ]);

  return (
    <PageWithSidebar>
      <div className="flex flex-col gap-2">
        {!isConnected && (
          <ConnectBanner text="To vote please connect your account" />
        )}
        <ProposalListPanel
          title="Live Governance Proposals"
          errorText="Unable to load live governance proposals"
          emptyText="There are no active live proposals"
          isEmpty={liveProposals.length === 0}
          atoms={activeAtoms}
        >
          <LiveGovernanceProposals
            proposals={liveProposals}
            votedProposalIds={votedProposalIds.data! || []}
          />
        </ProposalListPanel>
        <ProposalListPanel
          title="Upcoming Proposals"
          errorText="Unable to load upcoming proposals"
          emptyText="There are no upcoming proposals"
          isEmpty={upcomingProposals.length === 0}
          atoms={[allProposals]}
        >
          <UpcomingProposals proposals={allProposals.data!} />
        </ProposalListPanel>
        <ProposalListPanel
          title="All Proposals"
          errorText="Unable to load the list of proposals"
          atoms={activeAtoms}
        >
          <AllProposalsTable votedProposalIds={votedProposalIds.data! || []} />
        </ProposalListPanel>
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
