import BigNumber from "bignumber.js";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";

import { chains } from "@namada/chains";
import { Select } from "@namada/components";
import { getIntegration } from "@namada/integrations";
import { Query } from "@namada/shared";
import { AccountType, Chain, Signer, Tokens } from "@namada/types";
import { shortenAddress } from "@namada/utils";

import { useAppSelector } from "store";

import { pipe } from "fp-ts/lib/function";
import { useCallback, useEffect, useState } from "react";
import { AccountsState } from "slices/accounts";
import { Proposal } from "slices/proposals";
import {
  ProposalCardVoteButton,
  ProposalDetailsAddresses,
  ProposalDetailsAddressesHeader,
  ProposalDetailsButtons,
  ProposalDetailsContainer,
  ProposalDetailsContent,
  ProposalDetailsContentMainHeader,
  ProposalDetailsContentParagraph,
  ProposalDetailsContentSubHeader,
} from "./Proposals.components";

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

  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { rpc } = useAppSelector<Chain>((state) => state.chain.config);
  const addresses = Object.keys(derived[chains.namada.id]);

  const [activeProposalVotes, setActiveProposalVotes] = useState<
    Map<string, boolean>
  >(new Map());
  const [maybeDelegations, setDelegations] = useState<
    O.Option<{ delegations: Record<string, BigNumber>; order: string[] }>
  >(O.none);
  const [maybeActiveDelegator, setActiveDelegator] = useState<O.Option<string>>(
    O.none
  );
  const [open, setOpen] = useState<boolean>(props.open);

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
      const integration = getIntegration(chains.namada.id);
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
          signer: maybeActiveDelegator.value,
          vote: voteStr,
          proposalId: BigInt(proposal.id),
        },
        {
          token: Tokens.NAM.address || "",
          feeAmount: new BigNumber(0),
          gasLimit: new BigNumber(20_000),
          chainId: chains.namada.chainId,
        },
        AccountType.Mnemonic
      );
    },
    [maybeActiveDelegator, maybeProposal]
  );

  useEffect(() => {
    const fetchData = async (proposal: Proposal): Promise<void> => {
      const query = new Query(rpc);
      try {
        const votes = await query.delegators_votes(BigInt(proposal.id));
        setActiveProposalVotes(new Map(votes));

        const totalDelegations: Record<string, BigNumber> =
          await query.get_total_delegations(addresses, proposal.startEpoch);
        const order = pipe(
          addresses,
          A.filter((address) => {
            return pipe(
              BigNumber(totalDelegations[address]),
              O.fromPredicate((v) => !v.isZero()),
              O.isSome
            );
          })
        );

        setDelegations(O.some({ delegations: totalDelegations, order }));
        setActiveDelegator(O.some(order[0]));
      } catch (e) {
        console.error(e);
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
    const { delegations, order: delegationsOrder } = maybeDelegations.value;
    const { id, content, status } = maybeProposal.value;
    const { title, authors, details, motivation, license } = content;
    const canVote = !Object.values(delegations)
      .reduce((acc, curr) => acc.plus(curr), BigNumber(0))
      .eq(0);

    const unexpectedFields = Object.entries(content)
      .filter(([k]) => !EXPECTED_CONTENT_FIELDS.includes(k))
      .sort(([a], [b]) => a.localeCompare(b));

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
          */}
          {status === "ongoing" && canVote && (
            <>
              <ProposalDetailsAddresses>
                <ProposalDetailsAddressesHeader>
                  Vote with address:
                </ProposalDetailsAddressesHeader>
                <Select
                  value={delegatorAddress}
                  data={delegationsOrder.map((address) => ({
                    value: address,
                    label: shortenAddress(address, 32, 32),
                  }))}
                  onChange={(e) => {
                    setActiveDelegator(O.some(e.target.value));
                  }}
                />
                Power: {delegations[delegatorAddress].toString()}
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
