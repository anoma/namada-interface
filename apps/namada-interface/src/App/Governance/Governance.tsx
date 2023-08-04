import * as O from "fp-ts/Option";
import BigNumber from "bignumber.js";

import { Query } from "@namada/shared";
import { chains } from "@namada/chains";

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
import { SettingsState } from "slices/settings";
import { useAppSelector } from "store";
import { useCallback, useEffect, useState } from "react";
import { ProposalDetails } from "./ProposalDetails";
import { Proposal } from "./types";

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
  const [activeProposal, setActiveProposal] = useState<O.Option<Proposal>>(
    O.none
  );

  const { rpc } = chains[chainId];
  const query = new Query(rpc);

  useEffect(() => {
    const fetchProposals = async (): Promise<void> => {
      try {
        const sdkProposals = await query.queryProposals();
        const proposals = sdkProposals.map((proposal) => ({
          ...proposal,
          content: JSON.parse(proposal.contentJSON) as Record<string, string>,
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
    setActiveProposal(O.some(proposal));
  }, []);

  const onDetailsClose = useCallback(() => {
    setActiveProposal(O.none);
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
                {proposal.content.title && `${proposal.content.title}: `}
                {proposal.content.details || ""}
              </ProposalCardText>
              {proposal.yesVotes && proposal.totalVotingPower && (
                <ProposalCardVotes
                  yes={proposal.yesVotes.toString()}
                  total={proposal.totalVotingPower.toString()}
                />
              )}
            </ProposalCardInfoContainer>
          </ProposalCard>
        ))}
      </ProposalsContainer>
      <ProposalDetails
        open={O.isSome(activeProposal)}
        onClose={onDetailsClose}
        maybeProposal={activeProposal}
      />
    </GovernanceContainer>
  );
};
