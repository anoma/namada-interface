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
  ProposalDetailsContentSubHeader,
  ProposalDetailsContentParagraph,
  ProposalDetailsContentMainHeader,
} from "./Governance.components";
import { useCallback, useEffect, useState } from "react";
import { SettingsState } from "slices/settings";
import { AccountsState } from "slices/accounts";
import { Proposal } from "./types";

export type ProposalDetailsProps = {
  open: boolean;
  onClose: () => void;
  maybeProposal: O.Option<Proposal>;
};

const EXPECTED_CONTENT_FIELDS = [
  "id",
  "title",
  "authors",
  "details",
  "motivation",
  "license",
];

export const ProposalDetails = (props: ProposalDetailsProps): JSX.Element => {
  const { onClose, maybeProposal } = props;

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

      if (O.isNone(maybeProposal)) {
        throw new Error("No proposal");
      }

      if (O.isNone(activeDelegator)) {
        throw new Error("No active delegator");
      }
      const proposal = maybeProposal.value;

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
    [activeDelegator, maybeProposal]
  );

  useEffect(() => {
    const fetchData = async (proposal: Proposal): Promise<void> => {
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

    if (addresses.length > 0 && O.isSome(maybeProposal)) {
      fetchData(maybeProposal.value);
    }
  }, [JSON.stringify(addresses), maybeProposal]);

  if (
    O.isSome(activeDelegator) &&
    O.isSome(delegators) &&
    O.isSome(maybeProposal)
  ) {
    const delegatorAddress = activeDelegator.value;
    const delegations = delegators.value;
    const { id, content, status, result } = maybeProposal.value;
    const { title, authors, details, motivation, license } = content;

    const unexpectedFields = Object.entries(content).filter(
      ([k]) => !EXPECTED_CONTENT_FIELDS.includes(k)
    );

    return (
      <ProposalDetailsContainer open={open} onClick={onContainerClick}>
        <ProposalDetailsContent>
          {/* main header */}
          <ProposalDetailsContentMainHeader>
            #{id} {title}
          </ProposalDetailsContentMainHeader>

          {/* authors */}
          {authors && (
            <ProposalDetailsContentParagraph>
              by: {authors}
            </ProposalDetailsContentParagraph>
          )}

          {/* details */}
          {details && (
            <>
              <ProposalDetailsContentSubHeader>
                Details:
              </ProposalDetailsContentSubHeader>
              <ProposalDetailsContentParagraph>
                {details}
              </ProposalDetailsContentParagraph>
            </>
          )}

          {/* motivation */}
          {motivation && (
            <>
              <ProposalDetailsContentSubHeader>
                Motivation:
              </ProposalDetailsContentSubHeader>
              <ProposalDetailsContentParagraph>
                {motivation}
              </ProposalDetailsContentParagraph>
            </>
          )}

          {/* license */}
          {license && (
            <>
              <ProposalDetailsContentSubHeader>
                License:
              </ProposalDetailsContentSubHeader>
              <ProposalDetailsContentParagraph>
                {license}
              </ProposalDetailsContentParagraph>
            </>
          )}
          {unexpectedFields.map(([k, v]) => (
            <>
              <ProposalDetailsContentSubHeader>
                {k}:
              </ProposalDetailsContentSubHeader>
              <ProposalDetailsContentParagraph>
                {v}
              </ProposalDetailsContentParagraph>
            </>
          ))}

          {/* status */}

          {/* voting section */}
          {status === "on-going" && !result && (
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
    return <></>;
  }
};
