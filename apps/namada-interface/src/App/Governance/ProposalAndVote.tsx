import { Panel } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import { useAtomValue } from "jotai";

import {
  proposalFamily,
  statusFamily,
  votedFamily,
  votesFamily,
} from "slices/proposals/index";
import { ProposalDescription } from "./ProposalDescription";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalStatus } from "./ProposalStatus";
import { VoteBreakdown } from "./VoteBreakdown";
import { VoteInfoCards } from "./VoteInfoCards";

import * as SQR from "slices/proposals/simplifiedQueryResult";

export const ProposalAndVote: React.FC = () => {
  const { proposalId = "" } = useSanitizedParams();

  const data = SQR.all([
    useAtomValue(proposalFamily(proposalId)),
    useAtomValue(votesFamily(proposalId)),
    useAtomValue(votedFamily(proposalId)),
    useAtomValue(statusFamily(proposalId)),
  ]);

  if (data.state !== "hasData") {
    return <h1>NOOOOOOOOOOOOOOOOO</h1>;
  }

  const [proposal, votes, voted, status] = data.data;

  if (typeof proposal === "undefined") {
    return <h1>NOOOOOOOOOOOOOOOOO</h1>;
  }

  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel>
          <ProposalHeader proposal={proposal} voted={voted} status={status} />
        </Panel>
        <Panel title="Description">
          <ProposalDescription />
        </Panel>
        <Panel>
          <VoteInfoCards />
        </Panel>
        <Panel>
          <VoteBreakdown />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel title="Proposal Status">
          <ProposalStatus votes={votes} />
        </Panel>
      </aside>
    </div>
  );
};
