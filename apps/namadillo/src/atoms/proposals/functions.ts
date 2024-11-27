import {
  ApiV1GovProposalGetStatusEnum as ApiIndexerProposalStatusEnum,
  DefaultApi,
  Proposal as IndexerProposal,
  ProposalStatusEnum as IndexerProposalStatusEnum,
  ProposalTallyTypeEnum as IndexerProposalTallyTypeEnum,
  ProposalTypeEnum as IndexerProposalTypeEnum,
  VotingPower as IndexerVotingPower,
  Pagination,
} from "@namada/indexer-client";
import {
  Account,
  AddRemove,
  PgfActions,
  Proposal,
  ProposalStatus,
  ProposalType,
  ProposalTypeString,
  TallyType,
  Vote,
  VoteProposalProps,
  VoteType,
} from "@namada/types";
import { assertNever, mapUndefined } from "@namada/utils";
import BigNumber from "bignumber.js";
import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { TransactionPair, buildTxPair } from "lib/query";
import { GasConfig } from "types";

import { fromHex } from "@cosmjs/encoding";
import { ChainSettings } from "types";
import { getSdkInstance } from "utils/sdk";

// TODO: this function is way too big
const decodeProposalType = (
  indexerProposalType: IndexerProposalTypeEnum,
  data: string | undefined
): ProposalType => {
  switch (indexerProposalType) {
    case IndexerProposalTypeEnum.Default:
      return {
        type: "default",
      };
    case IndexerProposalTypeEnum.DefaultWithWasm:
      if (typeof data === "undefined") {
        throw new Error("data was undefined for default_with_wasm proposal");
      }
      const dataBytes = fromHex(data);
      return {
        type: "default_with_wasm",
        data: dataBytes,
      };
    case IndexerProposalTypeEnum.PgfSteward:
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

    case IndexerProposalTypeEnum.PgfFunding:
      if (typeof data === "undefined") {
        throw new Error("data was undefined for pgf_payment proposal");
      }

      const pgfTargetSchema = t.type({
        Internal: t.type({
          target: t.string,
          amount: t.string,
        }),
      });

      const pgfIbcTargetSchema = t.type({
        Ibc: t.type({
          target: t.string,
          amount: t.string,
          channel_id: t.string,
          port_id: t.string,
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
            Retro: t.union([pgfTargetSchema, pgfIbcTargetSchema]),
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
          } else if ("Internal" in curr.Retro) {
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
          } else {
            const {
              target,
              amount,
              channel_id: channelId,
              port_id: portId,
            } = curr.Retro.Ibc;
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
                {
                  ibc: {
                    amount: amountAsBigNumber,
                    target,
                    channelId,
                    portId,
                  },
                },
              ],
            };
          }
        },
        { continuous: { add: [], remove: [] }, retro: [] }
      );

      return { type: "pgf_payment", data: pgfActions };
    default:
      throw new Error(
        `unknown proposal type string, got ${indexerProposalType}`
      );
  }
};

const toTally = (tallyType: IndexerProposalTallyTypeEnum): TallyType => {
  switch (tallyType) {
    case IndexerProposalTallyTypeEnum.TwoFifths:
      return "two-fifths";
    case IndexerProposalTallyTypeEnum.OneHalfOverOneThird:
      return "one-half-over-one-third";
    case IndexerProposalTallyTypeEnum.LessOneHalfOverOneThirdNay:
      return "less-one-half-over-one-third-nay";
    default:
      throw new Error(`unknown tally type string, got ${tallyType}`);
  }
};

const toProposal = (
  proposal: IndexerProposal,
  votingPower: IndexerVotingPower
): Proposal => {
  const ContentSchema = t.record(t.string, t.union([t.string, t.undefined]));
  const content = JSON.parse(proposal.content);
  const contentDecoded = ContentSchema.decode(content);

  if (E.isLeft(contentDecoded)) {
    throw new Error("content is not valid");
  }

  return {
    id: BigInt(proposal.id),
    author: proposal.author,
    content: contentDecoded.right,
    startEpoch: BigInt(proposal.startEpoch),
    endEpoch: BigInt(proposal.endEpoch),
    activationEpoch: BigInt(proposal.activationEpoch),
    startTime: BigInt(proposal.startTime),
    endTime: BigInt(proposal.endTime),
    activationTime: BigInt(proposal.activationTime),
    currentTime: BigInt(proposal.currentTime),
    proposalType: decodeProposalType(proposal.type, proposal.data),
    tallyType: toTally(proposal.tallyType),
    status: fromIndexerStatus(proposal.status),
    totalVotingPower: BigNumber(votingPower.totalVotingPower),
    yay: BigNumber(proposal.yayVotes),
    nay: BigNumber(proposal.nayVotes),
    abstain: BigNumber(proposal.abstainVotes),
  };
};

export const fetchProposalById = async (
  api: DefaultApi,
  id: bigint
): Promise<Proposal> => {
  const proposalPromise = api.apiV1GovProposalIdGet(Number(id));
  const totalVotingPowerPromise = api.apiV1PosVotingPowerGet();
  const [proposalResponse, votingPowerResponse] = await Promise.all([
    proposalPromise,
    totalVotingPowerPromise,
  ]);

  return toProposal(proposalResponse.data, votingPowerResponse.data);
};

const fromIndexerStatus = (
  indexerProposalStatus: IndexerProposalStatusEnum
): ProposalStatus => {
  switch (indexerProposalStatus) {
    case IndexerProposalStatusEnum.Pending:
      return "pending";
    case IndexerProposalStatusEnum.Voting:
      return "ongoing";
    case IndexerProposalStatusEnum.Passed:
      return "passed";
    case IndexerProposalStatusEnum.Rejected:
      return "rejected";
    default:
      return assertNever(indexerProposalStatus);
  }
};

const toIndexerStatus = (
  proposalStatus: ProposalStatus
): ApiIndexerProposalStatusEnum => {
  switch (proposalStatus) {
    case "pending":
      return ApiIndexerProposalStatusEnum.Pending;
    case "ongoing":
      return ApiIndexerProposalStatusEnum.VotingPeriod;
    case "passed":
      return ApiIndexerProposalStatusEnum.Passed;
    case "rejected":
      return ApiIndexerProposalStatusEnum.Rejected;
    default:
      return assertNever(proposalStatus);
  }
};

const toIndexerProposalType = (
  proposalType: ProposalTypeString
): IndexerProposalTypeEnum => {
  switch (proposalType) {
    case "default":
      return IndexerProposalTypeEnum.Default;
    case "default_with_wasm":
      return IndexerProposalTypeEnum.DefaultWithWasm;
    case "pgf_steward":
      return IndexerProposalTypeEnum.PgfSteward;
    case "pgf_payment":
      return IndexerProposalTypeEnum.PgfFunding;
    default:
      return assertNever(proposalType);
  }
};

export const fetchAllProposals = async (
  api: DefaultApi
): Promise<Proposal[]> => {
  const proposalsPromise = api.apiV1GovProposalAllGet();
  const totalVotingPowerPromise = api.apiV1PosVotingPowerGet();

  const [proposalResponse, votingPowerResponse] = await Promise.all([
    proposalsPromise,
    totalVotingPowerPromise,
  ]);

  return proposalResponse.data.map((proposal) =>
    toProposal(proposal, votingPowerResponse.data)
  );
};

export const fetchPaginatedProposals = async (
  api: DefaultApi,
  page?: number,
  status?: ProposalStatus,
  proposalType?: ProposalTypeString,
  search?: string
): Promise<{ proposals: Proposal[]; pagination: Pagination }> => {
  const proposalsPromise = api.apiV1GovProposalGet(
    mapUndefined((p) => p + 1, page), // indexer uses 1 as first page, not 0
    mapUndefined(toIndexerStatus, status),
    mapUndefined(toIndexerProposalType, proposalType),
    search,
    undefined
  );

  const totalVotingPowerPromise = api.apiV1PosVotingPowerGet();
  const [proposalResponse, votingPowerResponse] = await Promise.all([
    proposalsPromise,
    totalVotingPowerPromise,
  ]);

  const proposals = proposalResponse.data.results.map((proposal) =>
    toProposal(proposal, votingPowerResponse.data)
  );

  return {
    proposals,
    pagination: proposalResponse.data.pagination,
  };
};

export const fetchProposalVotes = async (
  api: DefaultApi,
  id: bigint
): Promise<Vote[]> => {
  const response = await api.apiV1GovProposalIdVotesGet(Number(id));

  // TODO: This is only needed for votes breakdown, check if it's still relevant
  const votingPower: [string, BigNumber][] = [
    ["_", BigNumber(0)], // TODO: return voting power
  ];

  const votes: Vote[] = response.data.results.map((vote) => ({
    address: vote.voterAddress,
    voteType: vote.vote,
    votingPower,
    isValidator: false,
  }));

  return votes;
};

export const fetchVotedProposalsByAccount = async (
  api: DefaultApi,
  account: Account
): Promise<{ proposalId: bigint; vote: VoteType }[]> => {
  const response = await api.apiV1GovVoterAddressVotesGet(account.address);

  return response.data.map(({ proposalId, vote }) => ({
    proposalId: BigInt(proposalId),
    vote,
  }));
};

export const createVoteProposalTx = async (
  proposalId: bigint,
  vote: VoteType,
  account: Account,
  gasConfig: GasConfig,
  chain: ChainSettings
): Promise<TransactionPair<VoteProposalProps>> => {
  try {
    const { tx } = await getSdkInstance();

    const voteProposalProps = {
      signer: account.address,
      proposalId,
      vote,
    };

    const transactionPair = await buildTxPair(
      account,
      gasConfig,
      chain,
      [voteProposalProps],
      tx.buildVoteProposal,
      account.address
    );
    return transactionPair;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
