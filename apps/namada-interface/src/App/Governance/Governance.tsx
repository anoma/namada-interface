import { Button, ButtonVariant } from "@namada/components";
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

const getStatus = (status: string, result: string): string => {
  return status !== "done" ? status : result;
};

export const Governance = (): JSX.Element => {
  return (
    <GovernanceContainer>
      <h1>Proposals</h1>
      <ProposalsContainer>
        {fakeProposals.map((proposal, i) => (
          <ProposalCard key={i}>
            <ProposalCardStatusContainer>
              <ProposalCardStatusInfo
                className={getStatus(proposal.status, proposal.result)}
              >
                {getStatus(proposal.status, proposal.result)}
              </ProposalCardStatusInfo>
              <ProposalCardVoteButtons>
                <ProposalCardVoteButton>Vote</ProposalCardVoteButton>
              </ProposalCardVoteButtons>
            </ProposalCardStatusContainer>
            <ProposalCardInfoContainer>
              <ProposalCardText>
                <ProposalCardId>{"#" + proposal.id}</ProposalCardId>
                {proposal.type}
              </ProposalCardText>
              <ProposalCardVotes
                title={`Yes: ${proposal.yesVotes}, No: ${proposal.noVotes}`}
                yes={proposal.yesVotes}
                no={proposal.noVotes}
              />
            </ProposalCardInfoContainer>
          </ProposalCard>
        ))}
      </ProposalsContainer>
    </GovernanceContainer>
  );
};

type Proposal = {
  id: string;
  type: string;
  author: string;
  startEpoch: number;
  endEpoch: number;
  yesVotes: number;
  noVotes: number;
  status: string;
  result: string;
};

const status = ["pending", "on-going", "done"];
const result = ["pending", "passed", "rejected"];
const fakeProposals: Proposal[] = [...Array(9).keys()].map((i) => ({
  id: i + "",
  type:
    "Type asd adasd wadwdasd wdwwdwas dawdasd wdasdas dwadsada dwadsada wda dwadsadads" +
    i,
  author: "Author " + i,
  startEpoch: i,
  endEpoch: i + 1,
  yesVotes: 40,
  noVotes: 60,
  status: status[Math.floor(Math.random() * status.length)],
  result: result[Math.floor(Math.random() * result.length)],
}));
