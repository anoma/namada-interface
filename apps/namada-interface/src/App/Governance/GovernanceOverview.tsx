import { Panel } from "@namada/components";
import { ConnectBanner } from "App/Common/ConnectBanner";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useNavigate } from "react-router-dom";
import { proposalFamily } from "slices/proposals";
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

  //const allProposalsQueryResult =
  //  useAtomValue(allProposalsWithExtraInfoAtom);

  const allProposalsQueryResult = useAtomValue(proposalFamily(0));

  if (!allProposalsQueryResult.isSuccess) {
    // TODO: what to do here? navigating immediately doesn't work with isSuccess
    //navigate(TopLevelRoute.Wallet);
    console.log(allProposalsQueryResult.error);
    return null;
  }

  //const allProposals = allProposalsQueryResult.data;
  const allProposals = [
    {
      proposal: allProposalsQueryResult.data,
      status: { status: "pending" } as const,
      votes: {
        yes: BigNumber(0),
        no: BigNumber(0),
        abstain: BigNumber(0),
      },
      voted: true,
    },
  ];

  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        {!isConnected && (
          <ConnectBanner text="To vote please connect your account" />
        )}
        <Panel title="Live Governance Proposals">
          <LiveGovernanceProposals allProposals={allProposals} />
        </Panel>
        <Panel title="Upcoming Proposals">
          <UpcomingProposals allProposals={allProposals} />
        </Panel>
        <Panel title="All Proposals">
          <AllProposalsTable allProposals={allProposals} />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel>
          <ProposalsSummary allProposals={allProposals} />
        </Panel>
      </aside>
    </div>
  );
};
