import {
  GovernanceContainer,
  ProposalCard,
  ProposalCardId,
  ProposalCardInfoContainer,
  ProposalCardStatusContainer,
  ProposalCardStatusInfo,
  ProposalCardText,
  ProposalCardVoteButton,
  ProposalCardVoteButtons,
  ProposalCardVotes,
  ProposalsContainer,
} from "./Governance.components";
import { chains } from "@namada/chains";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";
import { useCallback, useEffect, useState } from "react";
import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import { getIntegration } from "@namada/hooks";
import { AccountType, Signer, Tokens } from "@namada/types";

const getStatus = (status: string, result?: string): string => {
  return result || status;
};

const ProposalCardVotes2 = ({
  yes,
  total,
}: {
  yes: string;
  total: string;
}): JSX.Element => {
  const yesNo = new BigNumber(yes);
  const totalNo = new BigNumber(total);

  const yesPercentage = yesNo.div(totalNo).times(100).toNumber();
  const noPercentage = 100 - yesPercentage;

  return (
    <ProposalCardVotes
      title={`Yes: ${yes}, Total: ${total} (${yesPercentage.toFixed(2)})%`}
      yes={yesPercentage}
      no={noPercentage}
    />
  );
};

export const Governance = (): JSX.Element => {
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const { rpc } = chains[chainId];

  const voteYes = useCallback(async () => {
    const integration = getIntegration(chainId);
    const signer = integration.signer() as Signer;
    await signer.submitVoteProposal(
      {
        tx: {
          token: Tokens.NAM.address || "",
          feeAmount: new BigNumber(0),
          gasLimit: new BigNumber(0),
          chainId,
        },
        signer:
          "atest1d9khqw368qmnys6r8ymnzdzzgfrr2dpjxseryd338prrg33nxumnzdjrxdq5gwpexv6yzd2zsc6ned",
        vote: "yay",
        proposalId: BigInt(0),
      },

      AccountType.Mnemonic
    );
  }, []);

  useEffect(() => {
    const fetchProposals = async (): Promise<void> => {
      const query = new Query(rpc);
      const proposals = await query.query_proposals();
      console.log(proposals);
      setProposals((p) => [...proposals, ...p]);
    };
    fetchProposals();
  }, []);

  return (
    <GovernanceContainer>
      <h1>Proposals</h1>
      <ProposalsContainer>
        {proposals.map((proposal, i) => (
          <ProposalCard key={i}>
            <ProposalCardStatusContainer>
              <ProposalCardStatusInfo
                className={getStatus(proposal.status, proposal.result)}
              >
                {getStatus(proposal.status, proposal.result)}
              </ProposalCardStatusInfo>
              {proposal.status === "on-going" && !proposal.result && (
                <ProposalCardVoteButtons>
                  <ProposalCardVoteButton onClick={voteYes}>
                    Vote
                  </ProposalCardVoteButton>
                </ProposalCardVoteButtons>
              )}
            </ProposalCardStatusContainer>
            <ProposalCardInfoContainer>
              <ProposalCardText>
                <ProposalCardId>{"#" + proposal.id}</ProposalCardId>
                {proposal.content.title}: {proposal.content.details}
              </ProposalCardText>
              {proposal.yes_votes && proposal.total_voting_power && (
                <ProposalCardVotes2
                  yes={proposal.yes_votes}
                  total={proposal.total_voting_power}
                />
              )}
            </ProposalCardInfoContainer>
          </ProposalCard>
        ))}
      </ProposalsContainer>
    </GovernanceContainer>
  );
};

type Content = {
  abstract: string;
  authors: string;
  created: string;
  details: string;
  "discussions-to": string;
  license: string;
  motivation: string;
  requires: string;
  title: string;
};

type Proposal = {
  id: string;
  proposal_type: string;
  author: string;
  start_epoch: number;
  end_epoch: number;
  grace_epoch: number;
  content: Content;
  status: string;
  yes_votes?: string;
  total_voting_power?: string;
  result?: string;
};

const status = ["pending", "on-going"];
const result = [undefined, "passed", "rejected"];
const fakeProposals: Proposal[] = [...Array(9).keys()].map((i) => ({
  id: i + "",
  proposal_type: "Fake",
  author: "Author " + i,
  start_epoch: i,
  end_epoch: i + 10,
  grace_epoch: i + 15,
  content: {
    abstract: "Abstract " + i,
    authors: "Authors " + i,
    created: "Created " + i,
    details:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "discussions-to": "Discussions-to " + i,
    license: "License " + i,
    motivation: "Motivation " + i,
    requires: "Requires " + i,
    title: "Title " + i,
  },
  status: status[Math.floor(Math.random() * status.length)],
  yes_votes: "400",
  total_voting_power: "6000",
  result: result[Math.floor(Math.random() * result.length)],
}));
