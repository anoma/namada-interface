import { Stack } from "@namada/components";
import { ProposalWithExtraInfo } from "@namada/types";

//import {
//  proposalIdsAtom,
//  proposalsGroupedByStatusAtom,
//} from "slices/proposals";

const SummaryCard: React.FC<{
  title: string;
  content: React.ReactNode;
}> = ({ title, content }) => (
  <Stack gap={2} className="rounded bg-[#1b1b1b] p-4">
    <div className="text-xs">{title}</div>
    <div className="text-2xl">{content}</div>
  </Stack>
);

export const ProposalsSummary: React.FC<{
  allProposals: ProposalWithExtraInfo[];
}> = ({ allProposals }) => {
  //const proposalIds = useAtomValue(proposalIdsAtom);
  //const groupedProposals = useAtomValue(proposalsGroupedByStatusAtom);

  const total = allProposals.length;
  const ongoing = allProposals.filter(
    ({ status }) => status.status === "ongoing"
  ).length;
  const passed = allProposals.filter(
    ({ status }) => status.status === "finished" && status.passed
  ).length;
  const rejected = allProposals.filter(
    ({ status }) => status.status === "finished" && !status.passed
  ).length;

  return (
    <Stack gap={4}>
      <SummaryCard title="Total Proposals" content={total} />
      <SummaryCard title="Proposals in Voting Period" content={ongoing} />
      <SummaryCard title="Passed" content={passed} />
      <SummaryCard title="Rejected" content={rejected} />
    </Stack>
  );
};
