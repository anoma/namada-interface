import { deserialize } from "@dao-xyz/borsh";
import { getIntegration } from "@namada/integrations";
import { Proposal as ProposalSchema, Query } from "@namada/shared";
import {
  Account,
  Chain,
  DelegatorVote,
  ValidatorVote,
  Vote,
  isVoteType,
} from "@namada/types";
import BigNumber from "bignumber.js";

import {
  Proposal,
  ProposalStatus,
  ProposalWithExtraInfo,
  VoteType,
} from "@namada/types";

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

export const fetchProposalById = async (
  chain: Chain,
  id: bigint
): Promise<Proposal> => {
  const { rpc } = chain;
  const query = new Query(rpc);
  const proposalUint8Array = await query.query_proposal_by_id(BigInt(id));
  const deserialized = deserialize(proposalUint8Array, ProposalSchema);

  const content = JSON.parse(deserialized.content);

  return {
    ...deserialized,
    content,
    proposalType: { type: "default" },
  };
};

export const fetchAllProposals = async (chain: Chain): Promise<Proposal[]> => {
  const proposalCounter = await fetchProposalCounter(chain);

  const proposals: Promise<Proposal>[] = [];
  for (let id = BigInt(0); id < proposalCounter; id++) {
    proposals.push(fetchProposalById(chain, id));
  }

  return await Promise.all(proposals);
};

const fetchProposalByIdWithExtraInfo = async (
  chain: Chain,
  id: bigint,
  account: Account,
  currentEpoch: bigint
): Promise<ProposalWithExtraInfo> => {
  const proposal = await fetchProposalById(chain, id);
  const voted = await fetchProposalVoted(chain, id, account);
  const status = await fetchProposalStatus(chain, id);
  const votes = await fetchProposalVotes(chain, id);

  return { proposal, voted, status, votes };
};

export const fetchAllProposalsWithExtraInfo = async (
  chain: Chain,
  account: Account
): Promise<ProposalWithExtraInfo[]> => {
  const proposalCounter = await fetchProposalCounter(chain);
  const currentEpoch = await fetchCurrentEpoch(chain);

  const proposals: Promise<ProposalWithExtraInfo>[] = [];
  for (let id = BigInt(0); id < proposalCounter; id++) {
    proposals.push(
      fetchProposalByIdWithExtraInfo(chain, id, account, currentEpoch)
    );
  }

  return await Promise.all(proposals);
};

// TODO: this function is way too big
export const fetchProposalVotes = async (
  chain: Chain,
  id: bigint
): Promise<Vote[]> => {
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
): Promise<ProposalStatus> => {
  const currentEpoch = await fetchCurrentEpoch(chain);
  const { startEpoch, endEpoch } = await fetchProposalById(chain, id);

  if (startEpoch > currentEpoch) {
    return { status: "pending" };
  } else if (endEpoch > currentEpoch) {
    return { status: "ongoing" };
  } else {
    // TODO: check if passed
    return { status: "finished", passed: id % BigInt(2) === BigInt(0) };
  }
};

export const fetchProposalVoted = async (
  chain: Chain,
  id: bigint,
  account: Account
): Promise<boolean> => {
  const votes = await fetchProposalVotes(chain, id);
  return votes.some((vote) => vote.address === account.address);
};

export const performVote = async (
  proposalId: bigint,
  vote: VoteType,
  account: Account,
  chain: Chain
): Promise<void> => {
  const signer = getIntegration("namada").signer();

  if (typeof signer === "undefined") {
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

  return await signer.submitVoteProposal(
    {
      signer: account.address,
      proposalId,
      vote,
    },
    {
      token,
      feeAmount: BigNumber(0),
      gasLimit: BigNumber(20_000),
      chainId: chain.chainId,
      publicKey,
      memo: "",
    },
    account.type
  );
};

const TEST_PROPOSALS: Proposal[] = [
  //{
  //  id: "0",
  //  content: {
  //    title: "Some proposal",
  //  },
  //  startEpoch: BigNumber(4),
  //  endEpoch: BigNumber(12),
  //  graceEpoch: BigNumber(0),
  //  proposalType: {
  //    type: "default",
  //  },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "1",
  //  content: {
  //    title: "Another proposal",
  //  },
  //  startEpoch: BigNumber(10),
  //  endEpoch: BigNumber(14),
  //  graceEpoch: BigNumber(0),
  //  proposalType: { type: "pgf_payment" },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "2",
  //  content: {
  //    title: "Propose something else",
  //  },
  //  startEpoch: BigNumber(14),
  //  endEpoch: BigNumber(16),
  //  graceEpoch: BigNumber(0),
  //  proposalType: { type: "pgf_steward" },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "3",
  //  content: {
  //    title: "Propose another thing",
  //  },
  //  startEpoch: BigNumber(3),
  //  endEpoch: BigNumber(5),
  //  graceEpoch: BigNumber(0),
  //  proposalType: { type: "pgf_payment" },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "4",
  //  content: {
  //    title: "Propose more things",
  //  },
  //  startEpoch: BigNumber(3),
  //  endEpoch: BigNumber(7),
  //  graceEpoch: BigNumber(0),
  //  proposalType: { type: "pgf_payment" },
  //  author: "tknam13jfi53tgjefji3rh45hgehhgfhjejrhgfj45gej45gj",
  //},
  //{
  //  id: "5",
  //  content: {
  //    title: "Stewie for Steward 2024",
  //    authors: "stewie@heliax.dev",
  //    "discussions-to": "forum.namada.net/t/stewies-manifesto/1",
  //    created: "2024-01-01T00:00:01Z",
  //    license: "MIT",
  //    abstract:
  //      "Stewie is running for steward, with a focus on technical research. The technical research I will be focused on will definitely not be for weapons of mass destruction. There is some possibility however that I may be focusing somewhat on open source software for weapons of mass destruction.",
  //    motivation:
  //      "Nobody knows technical research better than me. Trust me. I know it. I have the best technical research. I will be the best steward. Last night, Namada called me and said, Stewie, thank you. I will make public goods funding great again",
  //    details:
  //      "As a genius baby, I possess an unmatched level of intelligence and a visionary mindset. I will utilize these qualities to solve the most complex problems, and direct public goods funding towards weapons of mass destruction ... i mean open source software for weapons of mass destruction",
  //  },
  //  startEpoch: BigNumber(4),
  //  endEpoch: BigNumber(14),
  //  graceEpoch: BigNumber(0),
  //  proposalType: {
  //    type: "default",
  //    data: [1,2,3]
  //  },
  //  author: "tnam13jfi53tgjefji3rheeeeeeeeeeeeeeeeeeeeeeeeeee",
  //},
];
