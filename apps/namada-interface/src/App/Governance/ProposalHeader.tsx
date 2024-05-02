import { ActionButton, ProgressBar, Stack } from "@namada/components";
import { formatEpoch } from "@namada/utils";
import clsx from "clsx";
import { useAtomValue } from "jotai";

import { Proposal, ProposalStatus, currentEpochAtom } from "slices/proposals";
import { StatusLabel, TypeLabel, VotedLabel } from "./ProposalLabels";

export const ProposalHeader: React.FC<{
  proposal: Proposal;
  voted: boolean;
  status: ProposalStatus;
}> = ({ proposal, voted, status }) => {
  const voteButtonDisabled = voted || status.status !== "ongoing";

  const { startEpoch, endEpoch } = proposal;
  const currentEpoch = useAtomValue(currentEpochAtom);

  if (!currentEpoch.isSuccess) {
    return <h1>OH NO</h1>;
  }

  const totalEpochs = endEpoch.minus(startEpoch);
  const relativeCurrentEpoch = currentEpoch.data.minus(startEpoch);

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

        <TypeLabel proposalType={proposal.proposalType} />

        <div className="text-xl">
          #{proposal.id} {proposal.content.title}
        </div>
      </div>

      <b className="bg-[#151515] col-start-1 col-end-2 row-start-2 row-end-3 h-[2px] w-full" />

      <div className="col-start-1 col-end-2 row-start-3 row-end-4 flex gap-2">
        <StatusLabel status={{ status: "ongoing" }} className="w-56" />
        {voted && <VotedLabel />}
      </div>

      <div
        className={clsx(
          "col-span-full row-start-4 row-end-5 bg-[#1b1b1b]",
          "grid grid-cols-[1fr_1fr_auto] rounded-md text-sm p-4"
        )}
      >
        <div className="font-bold">Progress</div>
        <div className="text-right">Hours TODO</div>

        <div className="col-span-2">
          <ProgressBar
            value={{ value: relativeCurrentEpoch, color: "#11DFDF" }}
            total={{ value: totalEpochs, color: "#3A3A3A" }}
          />
        </div>
        <div className="col-start-1">{formatEpoch(startEpoch)}</div>
        <div className="text-right">{formatEpoch(endEpoch)}</div>

        <div className="row-[1_/_span_3] col-start-3 self-center justify-self-center">
          <ActionButton
            className="w-32 ml-8"
            size="sm"
            borderRadius="sm"
            disabled={voteButtonDisabled}
          >
            Vote
          </ActionButton>
        </div>
      </div>
    </div>
  );
};
