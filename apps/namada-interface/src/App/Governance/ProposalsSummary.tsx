import { Stack } from "@namada/components";

//import {
//  proposalIdsAtom,
//  proposalsGroupedByStatusAtom,
//} from "slices/proposals";

const SummaryCard: React.FC<{
  title: string;
  content: React.ReactNode;
}> = ({ title, content }) => (
  <div className="rounded bg-[#1b1b1b] p-4">
    <div className="text-sm">{title}</div>
    <div className="text-xl">{content}</div>
  </div>
);

export const ProposalsSummary: React.FC = () => {
  //const proposalIds = useAtomValue(proposalIdsAtom);
  //const groupedProposals = useAtomValue(proposalsGroupedByStatusAtom);

  //const total = proposalIds.length;
  //const ongoing = groupedProposals.ongoing.length;
  //const passed = groupedProposals.passed.length;
  //const rejected = groupedProposals.rejected.length;

  const total = "TODO";
  const ongoing = "TODO";
  const passed = "TODO";
  const rejected = "TODO";

  return (
    <Stack gap={4}>
      <SummaryCard title="Total Proposals" content={total} />
      <SummaryCard title="Proposals in Voting Period" content={ongoing} />
      <SummaryCard title="Passed" content={passed} />
      <SummaryCard title="Rejected" content={rejected} />
    </Stack>
  );
};
