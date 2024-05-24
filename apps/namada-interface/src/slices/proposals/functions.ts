import { deserialize } from "@dao-xyz/borsh";
import { EncodedTx } from "@heliax/namada-sdk/web";
import { getIntegration } from "@namada/integrations";
import { Proposal as ProposalSchema, Query } from "@namada/shared";
import {
  Account,
  AddRemove,
  Chain,
  DelegatorVote,
  PgfActions,
  Proposal,
  ProposalStatus,
  ProposalType,
  ProposalTypeString,
  ValidatorVote,
  Vote,
  VoteType,
  isTallyType,
  isVoteType,
} from "@namada/types";
import BigNumber from "bignumber.js";
import * as E from "fp-ts/Either";
import * as t from "io-ts";

import { getSdkInstance } from "hooks";

const { NAMADA_INTERFACE_NO_INDEXER } = process.env;

export const fetchCurrentEpoch = async (chain: Chain): Promise<bigint> => {
  const { rpc } = chain;
  const query = new Query(rpc);
  return await query.query_epoch();
};

export const fetchProposalCounter = async (chain: Chain): Promise<bigint> => {
  const { rpc } = chain;
  const query = new Query(rpc);
  const proposalCounter: string = await query.query_proposal_counter();
  return BigInt(proposalCounter);
};

// TODO: this function is way too big
const decodeProposalType = async (
  typeString: string,
  data: string | undefined,
  chain: Chain,
  proposalId: bigint
): Promise<ProposalType> => {
  switch (typeString) {
    case "default":
      const wasmCode =
        typeof data === "undefined" ? undefined : (
          await fetchProposalCode(chain, proposalId)
        );

      return { type: "default", data: wasmCode };

    case "pgf_steward":
      if (typeof data === "undefined") {
        throw new Error("data was undefined for pgf_steward proposal");
      }

      const addRemoveSchema = t.array(
        t.union([t.type({ Add: t.string }), t.type({ Remove: t.string })])
      );

      const addRemoveDecoded = addRemoveSchema.decode(JSON.parse(data));

      if (E.isLeft(addRemoveDecoded)) {
        throw new Error("pgf_steward data is not valid");
      }

      const addRemove = addRemoveDecoded.right.reduce<AddRemove>(
        (acc, curr) => {
          if ("Add" in curr) {
            if ("add" in acc) {
              throw new Error(
                "found multiple add addresses in PgfSteward proposal"
              );
            }
            return { ...acc, add: curr.Add };
          } else {
            return { ...acc, remove: [...acc.remove, curr.Remove] };
          }
        },
        { remove: [] }
      );

      return { type: "pgf_steward", data: addRemove };

    case "pgf_payment":
      if (typeof data === "undefined") {
        throw new Error("data was undefined for pgf_payment proposal");
      }

      // TODO: add IBC target
      const pgfTargetSchema = t.type({
        Internal: t.type({
          target: t.string,
          amount: t.string,
        }),
      });

      const pgfActionsSchema = t.array(
        t.union([
          t.type({
            Continuous: t.union([
              t.type({ Add: pgfTargetSchema }),
              t.type({ Remove: pgfTargetSchema }),
            ]),
          }),
          t.type({
            Retro: pgfTargetSchema,
          }),
        ])
      );

      const pgfActionsDecoded = pgfActionsSchema.decode(JSON.parse(data));

      if (E.isLeft(pgfActionsDecoded)) {
        throw new Error("pgf_payment data is not valid");
      }

      const pgfActions = pgfActionsDecoded.right.reduce<PgfActions>(
        (acc, curr) => {
          if ("Continuous" in curr) {
            const continuous = curr.Continuous;
            const [
              {
                Internal: { target, amount },
              },
              key,
            ] =
              "Add" in continuous ?
                [continuous["Add"], "add" as const]
              : [continuous["Remove"], "remove" as const];

            const amountAsBigNumber = BigNumber(amount);

            if (amountAsBigNumber.isNaN()) {
              throw new Error(
                `couldn't parse amount to BigNumber, got ${amount}`
              );
            }

            return {
              ...acc,
              continuous: {
                ...acc.continuous,
                [key]: [
                  ...acc.continuous[key],
                  { internal: { target, amount: amountAsBigNumber } },
                ],
              },
            };
          } else {
            const { target, amount } = curr.Retro.Internal;
            const amountAsBigNumber = BigNumber(amount);

            if (amountAsBigNumber.isNaN()) {
              throw new Error(
                `couldn't parse amount to BigNumber, got ${amount}`
              );
            }

            return {
              ...acc,
              retro: [
                ...acc.retro,
                { internal: { amount: amountAsBigNumber, target } },
              ],
            };
          }
        },
        { continuous: { add: [], remove: [] }, retro: [] }
      );

      return { type: "pgf_payment", data: pgfActions };

    default:
      throw new Error(`unknown proposal type string, got ${typeString}`);
  }
};

export const fetchProposalById = async (
  chain: Chain,
  id: bigint
): Promise<Proposal> => {
  const { rpc } = chain;
  const query = new Query(rpc);
  const proposalUint8Array = await query.query_proposal_by_id(id);
  const deserialized = deserialize(proposalUint8Array, ProposalSchema);

  const content = JSON.parse(deserialized.content);

  const tallyType = deserialized.tallyType;

  if (!isTallyType(tallyType)) {
    throw new Error(`unknown tally type, got ${tallyType}`);
  }

  const proposalType = await decodeProposalType(
    deserialized.proposalType,
    deserialized.data,
    chain,
    id
  );

  const fetchedStatus = await fetchProposalStatus(chain, id);

  return {
    ...deserialized,
    ...fetchedStatus,
    content,
    proposalType,
    tallyType,
  };
};

export const fetchAllProposals = async (
  chain: Chain,
  status?: ProposalStatus,
  type?: ProposalTypeString,
  search?: string
): Promise<Proposal[]> => {
  const proposalCounter = await fetchProposalCounter(chain);

  const proposals: Promise<Proposal>[] = [];
  for (let id = BigInt(0); id < proposalCounter; id++) {
    proposals.push(fetchProposalById(chain, id));
  }

  const resolvedProposals = await Promise.all(proposals);

  const statusFiltered =
    typeof status === "undefined" ? resolvedProposals : (
      resolvedProposals.filter((p) => p.status === status)
    );

  const typeFiltered =
    typeof type === "undefined" ? statusFiltered : (
      statusFiltered.filter((p) => p.proposalType.type === type)
    );

  const searchFiltered =
    typeof search === "undefined" ? typeFiltered : (
      typeFiltered.filter(
        (p) =>
          p.content.title?.toLowerCase().includes(search.toLowerCase()) ||
          p.id.toString().includes(search)
      )
    );

  return Array(30).fill(searchFiltered).flat();
};

// TODO: this function is way too big
export const fetchProposalVotes = async (
  chain: Chain,
  id: bigint
): Promise<Vote[]> => {
  if (NAMADA_INTERFACE_NO_INDEXER) {
    return [];
  }

  const { endEpoch } = await fetchProposalById(chain, id);
  const currentEpoch = await fetchCurrentEpoch(chain);

  const epoch = endEpoch < currentEpoch ? endEpoch : currentEpoch;

  const { rpc } = chain;
  const query = new Query(rpc);
  const [validatorVotesResult, delegatorVotesResult]: [
    [string, string, string][], // validator votes [address, vote, voting power]
    [string, string, [string, string][]][], // delegator votes [address, vote]
  ] = await query.query_proposal_votes(id, epoch);

  const validatorVotes: ValidatorVote[] = validatorVotesResult.map(
    ([address, voteType, votingPower]) => {
      if (!isVoteType(voteType)) {
        throw new Error(`unknown vote type, got ${voteType}`);
      }

      const votingPowerAsBigNumber = BigNumber(votingPower);

      if (votingPowerAsBigNumber.isNaN()) {
        throw new Error("unable to parse voting power as big number");
      }

      return {
        address,
        voteType,
        isValidator: true,
        votingPower: votingPowerAsBigNumber,
      };
    }
  );

  const delegatorVotes: DelegatorVote[] = delegatorVotesResult.map(
    ([address, voteType, votingPower]) => {
      if (!isVoteType(voteType)) {
        throw new Error(`unknown vote type, got ${voteType}`);
      }

      const votingPowerAsBigNumber: [string, BigNumber][] = votingPower.map(
        ([validatorAddress, amount]) => {
          const amountAsBigNumber = BigNumber(amount);
          if (amountAsBigNumber.isNaN()) {
            throw new Error("unable to parse amount as big number");
          }

          return [validatorAddress, amountAsBigNumber];
        }
      );

      return {
        address,
        voteType,
        isValidator: false,
        votingPower: votingPowerAsBigNumber,
      } as const;
    }
  );

  return [...validatorVotes, ...delegatorVotes];
};

export const fetchProposalStatus = async (
  chain: Chain,
  id: bigint
): Promise<
  {
    [VT in VoteType]: BigNumber;
  } & {
    totalVotingPower: BigNumber;
    status: ProposalStatus;
  }
> => {
  if (NAMADA_INTERFACE_NO_INDEXER) {
    const status = (["pending", "ongoing", "passed", "rejected"] as const)[
      Number(id % BigInt(4))
    ];

    return {
      status,
      yay: BigNumber(300),
      nay: BigNumber(250),
      abstain: BigNumber(125),
      totalVotingPower: BigNumber(1000),
    };
  }

  const currentEpoch = await fetchCurrentEpoch(chain);
  const { startEpoch, endEpoch } = await fetchProposalById(chain, id);

  const epoch = endEpoch < currentEpoch ? endEpoch : currentEpoch;

  const { rpc } = chain;
  const query = new Query(rpc);

  const [passed, yayPower, nayPower, abstainPower, totalVotingPower]: [
    boolean,
    string,
    string,
    string,
    string,
  ] = await query.query_proposal_result(id, epoch);

  const yayPowerAsBigNumber = BigNumber(yayPower);
  if (yayPowerAsBigNumber.isNaN()) {
    throw new Error("couldn't parse yay power as BigNumber");
  }

  const nayPowerAsBigNumber = BigNumber(nayPower);
  if (nayPowerAsBigNumber.isNaN()) {
    throw new Error("couldn't parse nay power as BigNumber");
  }

  const abstainPowerAsBigNumber = BigNumber(abstainPower);
  if (abstainPowerAsBigNumber.isNaN()) {
    throw new Error("couldn't parse abstain power as BigNumber");
  }

  const totalVotingPowerAsBigNumber = BigNumber(totalVotingPower);
  if (totalVotingPowerAsBigNumber.isNaN()) {
    throw new Error("couldn't parse total voting power as BigNumber");
  }

  const status: ProposalStatus =
    startEpoch > currentEpoch ? "pending"
    : endEpoch > currentEpoch ? "ongoing"
    : passed ? "passed"
    : "rejected";

  return {
    status,
    yay: yayPowerAsBigNumber,
    nay: nayPowerAsBigNumber,
    abstain: abstainPowerAsBigNumber,
    totalVotingPower: totalVotingPowerAsBigNumber,
  };
};

export const fetchProposalVoted = async (
  chain: Chain,
  id: bigint,
  account: Account
): Promise<boolean> => {
  const votes = await fetchProposalVotes(chain, id);
  return votes.some((vote) => vote.address === account.address);
};

export const fetchVotedProposalIds = async (
  chain: Chain,
  account: Account
): Promise<bigint[]> => {
  const proposalCounter = await fetchProposalCounter(chain);

  const proposalIds: bigint[] = [];
  for (let id = BigInt(0); id < proposalCounter; id++) {
    const voted = await fetchProposalVoted(chain, id, account);
    if (voted) {
      proposalIds.push(id);
    }
  }

  return proposalIds;
};

export const fetchProposalCode = async (
  chain: Chain,
  id: bigint
): Promise<Uint8Array> => {
  const { rpc } = chain;
  const query = new Query(rpc);
  return await query.query_proposal_code(id);
};

export const performVote = async (
  proposalId: bigint,
  vote: VoteType,
  account: Account,
  chain: Chain
): Promise<void> => {
  const signingClient = getIntegration("namada").signer();

  if (typeof signingClient === "undefined") {
    throw new Error("no signer");
  }

  const token = chain.currency.address;
  if (typeof token === "undefined") {
    throw new Error("no chain currency address");
  }

  const publicKey = account.publicKey;
  if (typeof publicKey === "undefined") {
    throw new Error("no public key on account");
  }
  const { tx, rpc } = await getSdkInstance();
  const signer = account.address;

  const proposalProps = {
    signer,
    proposalId,
    vote,
  };

  const wrapperTxProps = {
    token,
    feeAmount: BigNumber(0),
    gasLimit: BigNumber(20_000),
    chainId: chain.chainId,
    publicKey,
    memo: "",
  };

  const txArray: EncodedTx[] = [];

  // RevealPK if needed
  const pk = await rpc.queryPublicKey(account.address);
  if (!pk) {
    const revealPkTx = await tx.buildRevealPk(wrapperTxProps, account.address);
    // Add to txArray to sign & broadcast below:
    txArray.push(revealPkTx);
  }

  const encodedTx = await tx.buildVoteProposal(wrapperTxProps, proposalProps);
  txArray.push(encodedTx);

  try {
    const signedTx = await signingClient.sign(signer, txArray);
    if (!signedTx) {
      throw new Error("Signing failed");
    }
    txArray.forEach(async (tx, i) => {
      await rpc.broadcastTx({
        wrapperTxMsg: tx.txMsg,
        tx: signedTx[i],
      });
    });
  } catch (e) {
    console.error(e);
  }
};
