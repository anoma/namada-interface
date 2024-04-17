import { Stack } from "@namada/components";

const SummaryCard: React.FC<{
  title: string;
  content: string;
}> = ({ title, content }) => (
  <div className="rounded bg-[#1b1b1b] p-4">
    <div className="text-sm">{title}</div>
    <div className="text-xl">{content}</div>
  </div>
);

export const ProposalsSummary: React.FC = () => {
  return (
    <Stack gap={4}>
      <SummaryCard title="Total Proposals" content="153" />
      <SummaryCard title="Proposals in Voting Period" content="153" />
      <SummaryCard title="Passed" content="153" />
      <SummaryCard title="Rejected" content="153" />
    </Stack>
  );
};
