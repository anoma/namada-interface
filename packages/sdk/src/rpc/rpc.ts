import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { SignedTx } from "tx/types";
import {
  BondsResponse,
  Delegation,
  DelegationResponse,
  StakingPositions,
  UnbondsResponse,
} from "./types";

/**
 * API for executing RPC requests with Namada
 */
export class Rpc {
  /**
   * @param {SdkWasm} sdk - Instance of Sdk struct from wasm lib
   * @param {QueryWasm} query - Instance of Query struct from wasm lib
   */
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm
  ) {}

  /**
   * Query balances from chain
   * @async
   * @param {string} owner
   * @param {string[]} tokens
   * @returns {string[][]} [address][amount]
   */
  async queryBalance(owner: string, tokens: string[]): Promise<string[][]> {
    return await this.query.query_balance(owner, tokens);
  }

  /**
   * Query native token from chain
   * @async
   * @returns {string}
   */
  async queryNativeToken(): Promise<string> {
    return await this.query.query_native_token();
  }

  /**
   * Query public key
   * @async
   * @returns {string}
   */
  async queryPublicKey(owner: string): Promise<string> {
    return await this.query.query_public_key(owner);
  }

  /**
   * Query all validator addresses
   * @async
   * @returns {string[]} All validator addresses
   */
  async queryAllValidators(): Promise<string[]> {
    return await this.query.query_all_validator_addresses();
  }

  /**
   * Query delegations by owner addresses
   * @async
   * @param {string[]} owners
   * @returns {Delegation[]}
   */
  async queryDelegations(owners: string[]): Promise<Delegation[]> {
    const delegations = await this.query.query_my_validators(owners);
    return delegations.map((delegation: DelegationResponse) => {
      const [owner, validator, totalBonds, totalUnbonds, withdrawable] =
        delegation;
      return {
        owner,
        validator,
        totalBonds,
        totalUnbonds,
        withdrawable,
      };
    });
  }

  /**
   * Query staking positions
   * @async
   * @param {string[]} owners
   * @returns {StakingPositions}
   */
  async queryStakingPositions(owners: string[]): Promise<StakingPositions> {
    const [bonds, unbonds] = await this.query.query_staking_positions(owners);
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
   * @param {string} owner
   * @returns {number}
   */
  async queryTotalBonds(owner: string): Promise<number> {
    return await this.query.query_total_bonds(owner);
  }

  /**
   * Broadcast a Tx to the ledger
   * @async
   * @param {SignedTx} signedTx - Transaction with signature
   * @returns {void}
   */
  async broadcastTx(signedTx: SignedTx): Promise<void> {
    const { txMsg, tx } = signedTx;
    await this.sdk.process_tx(tx, txMsg);
  }
}
