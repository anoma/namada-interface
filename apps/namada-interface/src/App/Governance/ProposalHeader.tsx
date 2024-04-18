import { ActionButton, Stack } from "@namada/components";
import { Proposal } from "slices/proposals";

export const ProposalHeader: React.FC = () => {
  const proposal: Proposal = {
    id: "882",
  } as Proposal;

  return (
    <div className="grid grid-cols-[1fr_auto] grow-rows-[auto_2px_auto_auto]">
      <Stack gap={2} className="col-start-2 col-end-3 row-start-1 row-end-2">
        <ActionButton color="white">JSON</ActionButton>

        <ActionButton color="white">WASM</ActionButton>
      </Stack>

      <div className="col-start-1 col-end-2 row-start-1 row-end-2">
        <div className="text-xs text-[#929292]">
          Governance / Proposal #{proposal.id}
        </div>

        <div className="text-xl">
          #{proposal.id} Allocate 1% of supply to re-designing the end user
          interface
        </div>
      </div>

      <b className="bg-pink col-start-1 col-end-2 row-start-2 row-end-3 h-full w-full" />

      <div className="col-start-1 col-end-2 row-start-3 row-end-4">
        Label label
      </div>

      <div className="col-span-full row-start-4 row-end-5 bg-[#1b1b1b]">
        Progress
      </div>
    </div>
  );
};
