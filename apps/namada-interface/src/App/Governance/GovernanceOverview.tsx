import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { useAtomValue } from "jotai";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { AllProposalsTable } from "./AllProposalsTable";
import { LiveGovernanceProposals } from "./LiveGovernanceProposals";
import { ProposalsSummary } from "./ProposalsSummary";

//const GovernanceTitle = ({
//  title,
//  subtitle,
//}: {
//  title: string;
//  subtitle: string;
//}): JSX.Element => (
//  <>
//    {title}
//    <span className="text-sm text-gray">{subtitle}</span>
//  </>
//);

export const GovernanceOverview: React.FC = () => {
  const isConnected = useAtomValue(namadaExtensionConnectedAtom);

  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        {!isConnected && (
          <ConnectBanner text="To vote please connect your account" />
        )}
        <Panel title="Live Governance Proposals">
          <LiveGovernanceProposals />
        </Panel>
        <Panel title="Upcoming Proposals">OK</Panel>
        <Panel title="All Proposals">
          <AllProposalsTable />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel>
          <ProposalsSummary />
        </Panel>
      </aside>
    </div>
  );
};
