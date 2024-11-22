import { SegmentedBar, Stack } from "@namada/components";

import { Proposal } from "@namada/types";
import { routes } from "App/routes";
import clsx from "clsx";
import { generatePath, useNavigate } from "react-router-dom";
import { StatusLabel, TypeLabel } from "./ProposalLabels";

const ProposalListItem: React.FC<{
  proposal: Proposal;
}> = ({ proposal }) => {
  const navigate = useNavigate();

  const barData = [
    {
      value: 100,
      color: "#3A3A3A",
    },
  ];

  return (
    <Stack
      as="li"
      gap={3}
      onClick={() =>
        navigate(
          generatePath(routes.governanceProposal, {
            proposalId: proposal.id.toString(),
          })
        )
      }
      className={clsx(
        "group/proposal cursor-pointer",
        "rounded-md bg-[#191919] p-4"
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <StatusLabel
          className="text-[10px] min-w-38"
          status={proposal.status}
        />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-[6ch] text-sm">#{proposal.id.toString()}</div>
        <div className="flex-1 leading-tight">{proposal.content.title}</div>
        <TypeLabel proposalType={proposal.proposalType} color="dark" />
      </div>

      <SegmentedBar data={barData} />
    </Stack>
  );
};

export const UpcomingProposals: React.FC<{
  proposals: Proposal[];
}> = ({ proposals }) => {
  return (
    <div className="max-h-[490px] flex flex-col">
      <Stack
        gap={4}
        as="ul"
        className="dark-scrollbar overscroll-contain overflow-x-auto"
      >
        {proposals.map((proposal) => (
          <ProposalListItem proposal={proposal} key={proposal.id.toString()} />
        ))}
      </Stack>
    </div>
  );
};
