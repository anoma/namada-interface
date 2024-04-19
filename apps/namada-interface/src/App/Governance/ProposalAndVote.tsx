import { Panel } from "@namada/components";

import { ProposalDescription } from "./ProposalDescription";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalStatus } from "./ProposalStatus";
import { VoteBreakdown } from "./VoteBreakdown";
import { VoteInfoCards } from "./VoteInfoCards";

export const ProposalAndVote: React.FC = () => {
  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel>
          <ProposalHeader />
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
          <ProposalStatus />
        </Panel>
      </aside>
    </div>
  );
};
