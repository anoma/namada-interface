import * as O from "fp-ts/Option";
import * as A from "fp-ts/Array";
import * as R from "fp-ts/Record";
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
} from "./Proposals.components";
import { useCallback, useEffect, useState } from "react";
import { SettingsState } from "slices/settings";
import { AccountsState } from "slices/accounts";
import { Proposal } from "slices/proposals";
import { pipe } from "fp-ts/lib/function";

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
  const [maybeDelegations, setDelegations] = useState<
    O.Option<Record<string, BigNumber>>
  >(O.none);
  const [maybeActiveDelegator, setActiveDelegator] = useState<O.Option<string>>(
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

      if (O.isNone(maybeActiveDelegator)) {
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
          signer: maybeActiveDelegator.value,
          vote: voteStr,
          proposalId: BigInt(proposal.id),
        },

        AccountType.Mnemonic
      );
    },
    [maybeActiveDelegator, maybeProposal]
  );

  useEffect(() => {
    const fetchData = async (proposal: Proposal): Promise<void> => {
      try {
        //TODO: fp-ts promise
        const votes = await query.delegators_votes(BigInt(proposal.id));
        setActiveProposalVotes(new Map(votes));

        const totalDelegations = await query.get_total_delegations(
          addresses,
          proposal.startEpoch - BigInt(1)
        );

        //TODO: test if order does not change after voting
        // and if status(yey buttons) updates~!!!!

        // We filter over addresses to be sure that the order is correct
        const delegations = pipe(
          addresses,
          A.filterMap((address) => {
            return pipe(
              BigNumber(totalDelegations[address]),
              O.fromPredicate((v) => !v.isZero()),
              O.map((v) => [address, v] as [string, BigNumber])
            );
          }),
          R.fromEntries
        );

        setDelegations(O.some(delegations));
        setActiveDelegator(O.some(Object.keys(totalDelegations)[0]));
      } catch (e) {
        // TODO: handle rpc error
      }
    };

    if (addresses.length > 0 && O.isSome(maybeProposal)) {
      fetchData(maybeProposal.value);
    }
  }, [JSON.stringify(addresses), maybeProposal]);

  if (
    O.isSome(maybeActiveDelegator) &&
    O.isSome(maybeDelegations) &&
    O.isSome(maybeProposal)
  ) {
    const delegatorAddress = maybeActiveDelegator.value;
    const delegations = maybeDelegations.value;
    const { id, content, status, proposalType } = maybeProposal.value;
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
          {unexpectedFields.map(([k, v], i) => (
            <div key={`field-${i}`}>
              <ProposalDetailsContentSubHeader>
                {k}:
              </ProposalDetailsContentSubHeader>
              <ProposalDetailsContentParagraph>
                {v}
              </ProposalDetailsContentParagraph>
            </div>
          ))}

          {/* status */}

          {/* voting section */}
          {/* We only want to allow to vote when:
            - the proposal is on-going
            - the proposal is not a eth_bridge proposal */}
          {proposalType !== "eth_bridge" && status === "on-going" && (
            <>
              <ProposalDetailsAddresses>
                <ProposalDetailsAddressesHeader>
                  Vote with address:
                </ProposalDetailsAddressesHeader>
                <Select
                  value={delegatorAddress}
                  data={Object.keys(delegations).map((address) => ({
                    value: address,
                    label: shortenAddress(address, 32, 32),
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
