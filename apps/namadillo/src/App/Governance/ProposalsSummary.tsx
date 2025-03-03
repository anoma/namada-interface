import { Stack } from "@namada/components";
import { Proposal } from "@namada/types";
import { chainStatusAtom } from "atoms/chain";
import { useAtomValue } from "jotai";

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
  allProposals: Proposal[];
}> = ({ allProposals }) => {
  const chainStatus = useAtomValue(chainStatusAtom);
  const epoch = chainStatus?.epoch;
  const total = allProposals.length;
  const ongoing = allProposals.filter(
    ({ status }) => status === "ongoing"
  ).length;
  const passed = allProposals.filter(
    ({ status }) => status === "passed"
  ).length;
  const rejected = allProposals.filter(
    ({ status }) => status === "rejected"
  ).length;

  const executed = allProposals.filter(({ status, activationEpoch }) => {
    return !epoch ? "-" : (
        status === "passed" && Number(activationEpoch) <= epoch
      );
  }).length;

  return (
    <Stack gap={4}>
      <SummaryCard title="Total Proposals" content={total} />
      <SummaryCard title="Proposals in Voting Period" content={ongoing} />
      <SummaryCard title="Passed" content={passed} />
      <SummaryCard title="Rejected" content={rejected} />
      <SummaryCard title="Executed" content={executed} />
    </Stack>
  );
};
