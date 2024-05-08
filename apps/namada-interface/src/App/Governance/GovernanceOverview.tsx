import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { allProposalsWithExtraInfoAtom } from "slices/proposals";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { AllProposalsTable } from "./AllProposalsTable";
import { LiveGovernanceProposals } from "./LiveGovernanceProposals";
import { ProposalsSummary } from "./ProposalsSummary";
import { UpcomingProposals } from "./UpcomingProposals";

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
  const navigate = useNavigate();

  const isConnected = useAtomValue(namadaExtensionConnectedAtom);

  const allProposals = useAtomValue(allProposalsWithExtraInfoAtom);

  if (!allProposals.isSuccess) {
    // TODO: what to do here? navigating immediately doesn't work with isSuccess
    //navigate(TopLevelRoute.Wallet);
    console.log(allProposals.error);
    return null;
  }

  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        {!isConnected && (
          <ConnectBanner text="To vote please connect your account" />
        )}
        <Panel title="Live Governance Proposals">
          <LiveGovernanceProposals allProposals={allProposals.data} />
        </Panel>
        <Panel title="Upcoming Proposals">
          <UpcomingProposals allProposals={allProposals.data} />
        </Panel>
        <Panel title="All Proposals">
          <AllProposalsTable allProposals={allProposals.data} />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel>
          <ProposalsSummary allProposals={allProposals.data} />
        </Panel>
      </aside>
    </div>
  );
};
