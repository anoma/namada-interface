import { Panel, SkeletonLoading } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { PageWithSidebar } from "App/Common/PageWithSidebar";
import { allProposalsAtom, votedProposalsAtom } from "atoms/proposals";
import {
  atomsAreFetching,
  atomsAreLoaded,
  useNotifyOnAtomError,
} from "atoms/utils";
import { useAuthenticatedStatus } from "hooks/useAuthenticatedStatus";
import { useAtomValue } from "jotai";
import { AllProposalsTable } from "./AllProposalsTable";
import { LiveGovernanceProposals } from "./LiveGovernanceProposals";
import { ProposalListPanel } from "./ProposalListPanel";
import { ProposalsSummary } from "./ProposalsSummary";
import { UpcomingProposals } from "./UpcomingProposals";

export const GovernanceOverview: React.FC = () => {
  const allProposals = useAtomValue(allProposalsAtom);
  const votedProposals = useAtomValue(votedProposalsAtom);
  const { isAuthenticated } = useAuthenticatedStatus();

  // TODO: is there a better way than this to show that votedProposalIdsAtom
  // is dependent on isConnected?
  const extensionAtoms = isAuthenticated ? [votedProposals] : [];
  const activeAtoms = [allProposals, ...extensionAtoms];

  const liveProposals =
    allProposals.data?.filter((proposal) => proposal.status === "ongoing") ||
    [];

  const upcomingProposals =
    allProposals.data?.filter((proposal) => proposal.status === "pending") ||
    [];

  useNotifyOnAtomError(activeAtoms, [
    allProposals.isError,
    votedProposals.isError,
  ]);

  return (
    <PageWithSidebar>
      <div className="flex flex-col gap-2">
        <ConnectBanner
          disconnectedText="To vote please connect your account"
          missingAccountText="To vote please create or import an account using Namada keychain"
        />
        <ProposalListPanel
          title="Live Proposals"
          errorText="Unable to load live governance proposals"
          emptyText="There are no live proposals"
          isEmpty={liveProposals.length === 0}
          atoms={activeAtoms}
        >
          <LiveGovernanceProposals
            proposals={liveProposals}
            votedProposals={votedProposals.data || []}
          />
        </ProposalListPanel>
        <ProposalListPanel
          title="Upcoming Proposals"
          errorText="Unable to load upcoming proposals"
          emptyText="There are no upcoming proposals"
          isEmpty={upcomingProposals.length === 0}
          atoms={[allProposals]}
        >
          <UpcomingProposals proposals={upcomingProposals} />
        </ProposalListPanel>
        <ProposalListPanel
          title="All Proposals"
          errorText="Unable to load the list of proposals"
          atoms={activeAtoms}
        >
          <AllProposalsTable
            votedProposalIds={(votedProposals.data || []).map(
              (v) => v.proposalId
            )}
          />
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
