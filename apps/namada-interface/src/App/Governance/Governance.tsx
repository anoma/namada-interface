import {
  GovernanceContainer,
  ProposalCard,
  ProposalCardId,
  ProposalCardInfoContainer,
  ProposalCardStatusContainer,
  ProposalCardStatusInfo,
  ProposalCardText,
  ProposalCardVotesContainer,
  ProposalsContainer,
} from "./Governance.components";
import { chains } from "@namada/chains";
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";
import { useCallback, useEffect, useState } from "react";
import { Query } from "@namada/shared";
import BigNumber from "bignumber.js";
import { Option } from "@namada/utils";
import { ProposalDetails } from "./ProposalDetails";

export type Proposal = {
  id: string;
  proposalType: string;
  author: string;
  startEpoch: bigint;
  endEpoch: bigint;
  graceEpoch: bigint;
  content: Content;
  status: string;
  yesVotes?: string;
  totalVotingPower?: string;
  result?: string;
};

export type Content = {
  abstract: string;
  authors: string;
  created: string;
  details: string;
  discussionsTo: string;
  license: string;
  motivation: string;
  requires: string;
  title: string;
};

const getStatus = (status: string, result?: string): string => {
  return result || status;
};

const ProposalCardVotes = ({
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
    <ProposalCardVotesContainer
      title={`Yes: ${yes}, Total: ${total} (${yesPercentage.toFixed(2)})%`}
      yes={yesPercentage}
      no={noPercentage}
    />
  );
};

export const Governance = (): JSX.Element => {
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeProposal, setActiveProposal] = useState<Option<Proposal>>(
    Option.none()
  );

  const { rpc } = chains[chainId];
  const query = new Query(rpc);

  useEffect(() => {
    const fetchProposals = async (): Promise<void> => {
      try {
        const sdkProposals = await query.query_proposals();
        const proposals = sdkProposals.map((proposal) => ({
          ...proposal,
          proposalType: proposal.proposal_type,
          startEpoch: BigInt(proposal.start_epoch),
          endEpoch: BigInt(proposal.end_epoch),
          graceEpoch: BigInt(proposal.grace_epoch),
          content: {
            ...proposal.content,
            discussionsTo: proposal.content["discussions-to"],
          },
          totalVotingPower: proposal.total_voting_power,
        }));
        setProposals(proposals);
      } catch (e) {
        console.error(e);
        setProposals([]);
      }
    };
    fetchProposals();
  }, []);

  const onProposalClick = useCallback((proposal: Proposal) => {
    setActiveProposal(Option.some(proposal));
  }, []);

  const onDetailsClose = useCallback(() => {
    setActiveProposal(Option.none());
  }, []);

  return (
    <GovernanceContainer>
      <h1>Proposals</h1>
      <ProposalsContainer>
        {proposals.map((proposal, i) => (
          <ProposalCard key={i} onClick={() => onProposalClick(proposal)}>
            <ProposalCardStatusContainer>
              <ProposalCardStatusInfo
                className={getStatus(proposal.status, proposal.result)}
              >
                {getStatus(proposal.status, proposal.result)}
              </ProposalCardStatusInfo>
            </ProposalCardStatusContainer>
            <ProposalCardInfoContainer>
              <ProposalCardText>
                <ProposalCardId>{"#" + proposal.id}</ProposalCardId>
                {proposal.content.title}: {proposal.content.details}
              </ProposalCardText>
              {proposal.yesVotes && proposal.totalVotingPower && (
                <ProposalCardVotes
                  yes={proposal.yesVotes}
                  total={proposal.totalVotingPower}
                />
              )}
            </ProposalCardInfoContainer>
          </ProposalCard>
        ))}
      </ProposalsContainer>
      <ProposalDetails
        open={activeProposal.some}
        onClose={onDetailsClose}
        maybeProposal={activeProposal}
      />
    </GovernanceContainer>
  );
};
