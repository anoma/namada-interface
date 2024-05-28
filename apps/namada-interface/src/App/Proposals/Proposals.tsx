import * as O from "fp-ts/Option";
import * as A from "fp-ts/Array";
import BigNumber from "bignumber.js";

import {
  ProposalsList,
  ProposalCard,
  ProposalCardId,
  ProposalCardInfoContainer,
  ProposalCardStatusContainer,
  ProposalCardStatusInfo,
  ProposalCardText,
  ProposalCardVotesContainer,
  ProposalsContainer,
} from "./Proposals.components";
import { useAppDispatch, useAppSelector } from "store";
import { useCallback, useEffect } from "react";
import { ProposalDetails } from "./ProposalDetails";
import {
  Proposal,
  ProposalsState,
  fetchProposals,
  setActiveProposal,
} from "slices/proposals";
import { pipe } from "fp-ts/lib/function";

const getStatus = (proposal: Proposal): string => {
  return proposal.status !== "finished" ? proposal.status : proposal.result;
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

export const Proposals = (): JSX.Element => {
  const dispatch = useAppDispatch();
  const { proposals, activeProposalId } = useAppSelector<ProposalsState>(
    (state) => state.proposals
  );

  useEffect(() => {
    dispatch(fetchProposals());
  }, []);

  const onProposalClick = useCallback((proposalId: string) => {
    dispatch(setActiveProposal(proposalId));
  }, []);

  const onDetailsClose = useCallback(() => {
    dispatch(setActiveProposal());
  }, []);

  const maybeProposal = pipe(
    proposals,
    A.findFirst((p) => p.id === activeProposalId)
  );

  return (
    <ProposalsContainer>
      <h1>Proposals</h1>
      <ProposalsList data-testid="proposals-list">
        {[...proposals].reverse().map((proposal, i) => (
          <ProposalCard key={i} onClick={() => onProposalClick(proposal.id)}>
            <ProposalCardStatusContainer>
              <ProposalCardStatusInfo className={getStatus(proposal)}>
                {getStatus(proposal)}
              </ProposalCardStatusInfo>
            </ProposalCardStatusContainer>
            <ProposalCardInfoContainer>
              <ProposalCardText>
                <ProposalCardId>{"#" + proposal.id}</ProposalCardId>
                {proposal.content.title && `${proposal.content.title}: `}
                {proposal.content.details || ""}
              </ProposalCardText>
              {proposal.status === "ongoing" && (
                <ProposalCardVotes
                  yes={proposal.totalYayPower.toString()}
                  total={proposal.totalVotingPower.toString()}
                />
              )}
            </ProposalCardInfoContainer>
          </ProposalCard>
        ))}
      </ProposalsList>
      <ProposalDetails
        open={O.isSome(maybeProposal)}
        onClose={onDetailsClose}
        maybeProposal={maybeProposal}
      />
    </ProposalsContainer>
  );
};
