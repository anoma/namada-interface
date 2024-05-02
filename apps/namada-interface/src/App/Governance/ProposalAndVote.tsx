import { Panel } from "@namada/components";
import { useSanitizedParams } from "@namada/hooks";
import BigNumber from "bignumber.js";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";

import {
  Proposal,
  ProposalStatus,
  Votes,
  proposalFamily,
  proposalStatusFamily,
  proposalVotedFamily,
  proposalVotesFamily,
} from "slices/proposals";
import { ProposalDescription } from "./ProposalDescription";
import { ProposalHeader } from "./ProposalHeader";
import { ProposalStatusSummary } from "./ProposalStatusSummary";
import { VoteBreakdown } from "./VoteBreakdown";
import { VoteInfoCards } from "./VoteInfoCards";

type AtomData = {
  proposal: Proposal;
  votes: Votes;
  voted: boolean;
  status: ProposalStatus;
};

export const ProposalAndVote: React.FC = () => {
  const [atomData, setAtomData] = useState<AtomData | null>(null);

  const { proposalId: proposalIdString = "" } = useSanitizedParams();

  const proposalId = Number.parseInt(proposalIdString);

  const proposal = useAtomValue(proposalFamily(proposalId));
  const votes = useAtomValue(proposalVotesFamily(proposalId));
  const voted = useAtomValue(proposalVotedFamily(proposalId));
  const status = useAtomValue(proposalStatusFamily(proposalId));

  // TODO: This whole thing seems wrong. How do I hide the details of getting
  // the atom values from this component but still obey the rules of hooks?
  useEffect(() => {
    if (Number.isNaN(proposalId)) {
      setAtomData(null);
      return;
    }

    if (
      !proposal.isSuccess ||
      !votes.isSuccess ||
      !voted.isSuccess ||
      !status.isSuccess
    ) {
      setAtomData(null);
      return;
    }

    setAtomData({
      proposal: proposal.data,
      votes: votes.data,
      voted: voted.data,
      status: status.data,
    });
  });

  if (atomData === null) {
    return <h1>OH NO</h1>;
  }

  // TODO: I think we're going to have a problem with this for ongoing proposals
  // because Namada seems to use the voting power in the end epoch to determine
  // whether the vote has passed, but while it's ongoing we have no idea what
  // that voting power will be.
  const totalVotingPower = BigNumber(4_000);

  return (
    <div className="grid grid-cols-[auto_270px] gap-2">
      <div className="flex flex-col gap-1.5">
        <Panel>
          <ProposalHeader
            proposal={atomData.proposal}
            voted={atomData.voted}
            status={atomData.status}
          />
        </Panel>
        <Panel title="Description">
          <ProposalDescription proposal={atomData.proposal} />
        </Panel>
        <Panel>
          <VoteInfoCards proposal={atomData.proposal} />
        </Panel>
        <Panel>
          <VoteBreakdown
            votes={atomData.votes}
            totalVotingPower={totalVotingPower}
          />
        </Panel>
      </div>
      <aside className="flex flex-col gap-2">
        <Panel title="Proposal Status">
          <ProposalStatusSummary
            proposal={atomData.proposal}
            votes={atomData.votes}
          />
        </Panel>
      </aside>
    </div>
  );
};
