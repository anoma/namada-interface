import { Panel } from "@namada/components";

import { ProposalStatus } from "./ProposalStatus";

export const ProposalAndVote: React.FC = () => {
  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel></Panel>
        <Panel title="Description"></Panel>
        <Panel></Panel>
        <Panel></Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel title="Proposal Status">
          <ProposalStatus />
        </Panel>
      </aside>
    </div>
  );
};
