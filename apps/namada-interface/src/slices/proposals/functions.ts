import { deserialize } from "@dao-xyz/borsh";
import { getIntegration } from "@namada/integrations";
import { Proposal as ProposalSchema, Query } from "@namada/shared";
import {
  Account,
  Chain,
  DelegatorVote,
  ValidatorVote,
  Vote,
  isTallyType,
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
  const proposalUint8Array = await query.query_proposal_by_id(id);
  const deserialized = deserialize(proposalUint8Array, ProposalSchema);

  const content = JSON.parse(deserialized.content);

  const tallyType = deserialized.tallyType;

  if (!isTallyType(tallyType)) {
    throw new Error(`unknown tally type, got ${tallyType}`);
  }

  const proposalType =
    deserialized.proposalType === "default" ? ({ type: "default" } as const)
    : deserialized.proposalType === "pgf_steward" ?
      ({ type: "pgf_steward" } as const)
    : deserialized.proposalType === "pgf_payment" ?
      ({ type: "pgf_payment" } as const)
    : undefined;

  if (typeof proposalType === "undefined") {
    throw new Error(`unknown proposal type, got ${proposalType}`);
  }

  return {
    ...deserialized,
    content,
    proposalType,
    tallyType,
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

  const status =
    startEpoch > currentEpoch ? ({ status: "pending" } as const)
    : endEpoch > currentEpoch ? ({ status: "ongoing" } as const)
    : ({ status: "finished", passed } as const);

  return {
    ...status,
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
