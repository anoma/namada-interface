import { deserialize } from "@dao-xyz/borsh";
import {
  Proposal,
  Proposals,
  Query as QueryWasm,
  Sdk as SdkWasm,
  TransferToEthereum,
} from "@namada/shared";

import { SignedTx } from "../tx/types";
import {
  Balance,
  BondsResponse,
  DelegationTotals,
  DelegatorsVotes,
  GasCosts,
  StakingPositions,
  StakingTotals,
  StakingTotalsResponse,
  UnbondsResponse,
} from "./types";

/**
 * API for executing RPC requests with Namada
 */
export class Rpc {
  /**
   * @param sdk - Instance of Sdk struct from wasm lib
   * @param query - Instance of Query struct from wasm lib
   */
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm
  ) {}

  /**
   * Query balances from chain
   * @async
   * @param owner - Owner address
   * @param tokens - Array of token addresses
   * @returns [[tokenAddress, amount]]
   */
  async queryBalance(owner: string, tokens: string[]): Promise<Balance> {
    return await this.query.query_balance(owner, tokens);
  }

  /**
   * Query native token from chain
   * @async
   * @returns Address of native token
   */
  async queryNativeToken(): Promise<string> {
    return await this.query.query_native_token();
  }

  /**
   * Query public key
   * Return string of public key if it has been revealed on chain, otherwise, return null
   * @async
   * @param address - Address to query
   * @returns String of public key if found
   */
  async queryPublicKey(address: string): Promise<string | undefined> {
    const pk = await this.query.query_public_key(address);
    return pk;
  }

  /**
   * Query all validator addresses
   * @async
   * @returns Array of all validator addresses
   */
  async queryAllValidators(): Promise<string[]> {
    return await this.query.query_all_validator_addresses();
  }

  /**
   * Query Proposals
   * @async
   * @returns List of the proposals
   */
  async queryProposals(): Promise<Proposal[]> {
    const serializedProposals = await this.query.query_proposals();
    const { proposals } = deserialize(serializedProposals, Proposals);
    return proposals;
  }

  /**
   * Query total delegations
   * @async
   * @param owners - Array of owner addresses
   * @param [epoch] - delegations at epoch
   * @returns Promise resolving to total delegations
   */
  async queryTotalDelegations(
    owners: string[],
    epoch?: bigint
  ): Promise<DelegationTotals> {
    return await this.query.get_total_delegations(owners, epoch);
  }

  /**
   * Query delegators votes
   * @async
   * @param proposalId - ID of the proposal
   * @returns Promise resolving to delegators votes
   */
  async queryDelegatorsVotes(proposalId: bigint): Promise<DelegatorsVotes> {
    return await this.query.delegators_votes(proposalId);
  }

  /**
   * Query staking totals by owner addresses
   * @async
   * @param owners - Array of owner addresses
   * @returns Promise resolving to staking totals
   */
  async queryStakingTotals(owners: string[]): Promise<StakingTotals[]> {
    const stakingAmounts = await this.query.query_my_validators(owners);
    return stakingAmounts.map(
      ([
        owner,
        validator,
        bonds,
        unbonds,
        withdrawable,
      ]: StakingTotalsResponse) => {
        return {
          owner,
          validator,
          bonds,
          unbonds,
          withdrawable,
        };
      }
    );
  }

  /**
   * Query bond and unbond details by owner addresses
   * @async
   * @param owners - Array of owner addresses
   * @returns Promise resolving to staking positions
   */
  async queryStakingPositions(owners: string[]): Promise<StakingPositions> {
    const [bonds, unbonds]: [BondsResponse[], UnbondsResponse[]] =
      await this.query.query_staking_positions(owners);

    return {
      bonds: bonds.map(
        ([owner, validator, amount, startEpoch]: BondsResponse) => ({
          owner,
          validator,
          amount,
          startEpoch,
        })
      ),
      unbonds: unbonds.map(
        ([
          owner,
          validator,
          amount,
          startEpoch,
          withdrawableEpoch,
        ]: UnbondsResponse) => ({
          owner,
          validator,
          amount,
          startEpoch,
          withdrawableEpoch,
        })
      ),
    };
  }

  /**
   * Query total bonds by owner address
   * @param owner - Owner address
   * @returns Total bonds amount
   */
  async queryTotalBonds(owner: string): Promise<number> {
    return await this.query.query_total_bonds(owner);
  }

  /**
   * Query pending transactions in the signed bridge pool
   * @async
   * @param owners - Array of owner addresses
   * @returns Promise resolving to pending ethereum transfers
   */
  async querySignedBridgePool(owners: string[]): Promise<TransferToEthereum[]> {
    return await this.query.query_signed_bridge_pool(owners);
  }

  /**
   * Query gas costs
   * @async
   * @returns [[tokenAddress, gasCost]]
   */
  async queryGasCosts(): Promise<GasCosts> {
    return await this.query.query_gas_costs();
  }

  /**
   * Broadcast a Tx to the ledger
   * @async
   * @param signedTx - Transaction with signature
   * @returns void
   */
  async broadcastTx(signedTx: SignedTx): Promise<string> {
    const { txMsg, tx } = signedTx;
    return await this.sdk.process_tx(tx, txMsg);
  }

  async shieldedSync(vks: string[]): Promise<void> {
    await this.query.shielded_sync(vks);
  }
}
