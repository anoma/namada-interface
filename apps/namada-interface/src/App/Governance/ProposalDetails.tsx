import * as O from "fp-ts/Option";
import BigNumber from "bignumber.js";

import { Select } from "@namada/components";
import { chains } from "@namada/chains";
import { Query } from "@namada/shared";
import { AccountType, Signer, Tokens } from "@namada/types";
import { shortenAddress } from "@namada/utils";
import { getIntegration } from "@namada/hooks";

import { useAppSelector } from "store";

import {
  ProposalCardVoteButton,
  ProposalDetailsContainer,
  ProposalDetailsAddresses,
  ProposalDetailsAddressesHeader,
  ProposalDetailsButtons,
  ProposalDetailsContent,
} from "./Governance.components";
import { Proposal } from "slices/proposals";
import { useCallback, useEffect, useState } from "react";
import { SettingsState } from "slices/settings";
import { AccountsState } from "slices/accounts";
import { AppLoader } from "App/App.components";
import { pipe } from "fp-ts/lib/function";

export type ProposalDetailsProps = {
  open: boolean;
  onClose: () => void;
  maybeProposal: O.Option<Proposal>;
};

export const ProposalDetails = (props: ProposalDetailsProps): JSX.Element => {
  if (O.isNone(props.maybeProposal)) {
    return <></>;
  }

  const proposal = props.maybeProposal.value;
  const { onClose } = props;

  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const addresses = Object.keys(derived[chainId]);

  const [activeProposalVotes, setActiveProposalVotes] = useState<
    Map<string, boolean>
  >(new Map());
  const [delegators, setDelegators] = useState<
    O.Option<Record<string, BigNumber>>
  >(O.none);
  const [activeDelegator, setActiveDelegator] = useState<O.Option<string>>(
    O.none
  );
  const [open, setOpen] = useState<boolean>(props.open);

  const { rpc } = chains[chainId];
  const query = new Query(rpc);

  const onContainerClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === e.currentTarget) {
        setOpen(false);
        onClose();
      }
    },
    []
  );

  const vote = useCallback(
    async (vote: boolean) => {
      const voteStr = vote ? "yay" : "nay";
      const integration = getIntegration(chainId);
      const signer = integration.signer() as Signer;

      if (O.isNone(activeDelegator)) {
        throw new Error("No active delegator");
      }

      await signer.submitVoteProposal(
        {
          tx: {
            token: Tokens.NAM.address || "",
            feeAmount: new BigNumber(0),
            gasLimit: new BigNumber(0),
            chainId,
          },
          signer: activeDelegator.value,
          vote: voteStr,
          proposalId: BigInt(proposal.id),
        },

        AccountType.Mnemonic
      );
    },
    [activeDelegator, proposal]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const votes = await query.get_proposal_votes(BigInt(proposal.id));
        setActiveProposalVotes(new Map(votes));

        const totalDelegations = await query.get_total_delegations(
          addresses,
          proposal.startEpoch - BigInt(1)
        );
        setDelegators(O.some(totalDelegations));
        setActiveDelegator(O.some(totalDelegations[0]));
      } catch (e) {
        // TODO: handle rpc error
      }
    };

    if (addresses.length > 0) {
      fetchData();
    }
  }, [JSON.stringify(addresses)]);

  if (O.isSome(activeDelegator) && O.isSome(delegators)) {
    const delegatorAddress = activeDelegator.value;
    const delegations = delegators.value;

    return (
      <ProposalDetailsContainer open={open} onClick={onContainerClick}>
        <ProposalDetailsContent>
          <h1>
            #{proposal.id} {proposal.content.title}
          </h1>
          <p>by: {proposal.content.authors}</p>
          <h3>Details:</h3>
          <p>{proposal.content.details}</p>
          <h3>Motivation:</h3>
          <p>{proposal.content.motivation}</p>
          <h3>License:</h3>
          <p>{proposal.content.license}</p>

          {proposal.status === "on-going" && !proposal.result && (
            <>
              <ProposalDetailsAddresses>
                <ProposalDetailsAddressesHeader>
                  Vote with address:
                </ProposalDetailsAddressesHeader>
                <Select
                  value={delegatorAddress}
                  data={Object.keys(delegations).map((a) => ({
                    value: a,
                    label: shortenAddress(a, 32, 32),
                  }))}
                  onChange={(e) => {
                    setActiveDelegator(O.some(e.target.value));
                  }}
                />
                Power: {delegations[delegatorAddress]}
              </ProposalDetailsAddresses>
              <ProposalDetailsButtons>
                <ProposalCardVoteButton
                  onClick={() => vote(true)}
                  disabled={activeProposalVotes.get(delegatorAddress) === true}
                  title={
                    activeProposalVotes.get(delegatorAddress)
                      ? "You have already voted YAY"
                      : ""
                  }
                >
                  Vote YAY
                </ProposalCardVoteButton>
                <ProposalCardVoteButton
                  onClick={() => vote(false)}
                  disabled={activeProposalVotes.get(delegatorAddress) === false}
                  title={
                    !activeProposalVotes.get(delegatorAddress)
                      ? "You have already voted NAY"
                      : ""
                  }
                  className="inverse"
                >
                  Vote NAY
                </ProposalCardVoteButton>
              </ProposalDetailsButtons>
            </>
          )}
        </ProposalDetailsContent>
      </ProposalDetailsContainer>
    );
  } else {
    return <AppLoader />;
  }
};
