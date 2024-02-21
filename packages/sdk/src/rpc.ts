import { Query as QueryWasm, Sdk as SdkWasm } from "@namada/shared";
import { SignedTx } from "tx/types";

/**
 * Rpc - API for executing RPC requests with Namada
 */
export class Rpc {
  constructor(
    protected readonly sdk: SdkWasm,
    protected readonly query: QueryWasm
  ) {}

  /**
   * Query balances from chain
   *
   * @param {string} owner
   * @param {string[]} tokens
   *
   * @return {string[][]} [address][amount]
   */
  async queryBalance(owner: string, tokens: string[]): Promise<string[][]> {
    return await this.query.query_balance(owner, tokens);
  }

  /**
   * Query native token from chain
   * @return {string}
   */
  async queryNativeToken(): Promise<string> {
    return await this.query.query_native_token();
  }

  /**
   * Query public key
   * @return {string}
   */
  async queryPublicKey(owner: string): Promise<string> {
    return await this.query.query_public_key(owner);
  }

  /**
   * Query all validator addresses
   * @return {string[]}
   */
  async queryAllValidators(): Promise<string[]> {
    return await this.query.query_all_validator_addresses();
  }

  /**
   * Broadcast a Tx to the ledger
   */
  async broadcastTx(signedTx: SignedTx): Promise<void> {
    const { txMsg, tx } = signedTx;
    await this.sdk.process_tx(tx, txMsg);
  }
}
