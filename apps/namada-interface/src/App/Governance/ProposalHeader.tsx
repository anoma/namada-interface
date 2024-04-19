import {
  ActionButton,
  InsetLabel,
  SegmentedBar,
  Stack,
} from "@namada/components";
import clsx from "clsx";
import { Proposal } from "slices/proposals";

import { StatusLabel, VotedLabel } from "./ProposalLabels";

export const ProposalHeader: React.FC = () => {
  const proposal: Proposal = {
    id: "882",
  } as Proposal;

  return (
    <div className="grid grid-cols-[1fr_auto] grow-rows-[auto_auto_auto_auto] gap-y-4">
      <Stack gap={2} className="col-start-2 col-end-3 row-start-1 row-end-2">
        <ActionButton color="white">JSON</ActionButton>

        <ActionButton color="white">WASM</ActionButton>
      </Stack>

      <div className="col-start-1 col-end-2 row-start-1 row-end-2">
        <div className="text-xs text-[#929292]">
          Governance / Proposal #{proposal.id}
        </div>

        <InsetLabel>Community pool spend</InsetLabel>

        <div className="text-xl">
          #{proposal.id} Allocate 1% of supply to re-designing the end user
          interface
        </div>
      </div>

      <b className="bg-[#151515] col-start-1 col-end-2 row-start-2 row-end-3 h-[2px] w-full" />

      <div className="col-start-1 col-end-2 row-start-3 row-end-4 flex gap-2">
        <StatusLabel status="ongoing" className="w-56" />
        <VotedLabel />
      </div>

      <div
        className={clsx(
          "col-span-full row-start-4 row-end-5 bg-[#1b1b1b]",
          "grid grid-cols-[1fr_1fr_auto] rounded-md text-sm p-4"
        )}
      >
        <div className="font-bold">Progress</div>
        <div className="text-right">Hours</div>

        <div className="col-span-2">
          <SegmentedBar
            data={[
              { value: 70, color: "#11DFDF" },
              { value: 30, color: "#3A3A3A" },
            ]}
          />
        </div>
        <div className="col-start-1">Date 1</div>
        <div className="text-right">Date 2</div>

        <div className="row-[1_/_span_3] col-start-3 self-center justify-self-center">
          <ActionButton className="w-32 ml-8" size="sm" borderRadius="sm">
            Vote
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
