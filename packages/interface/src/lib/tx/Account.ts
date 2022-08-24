import { AnomaClient } from "@anoma/wasm";
import { Tokens, TxWasm, VpWasm } from "constants/";

class Account {
  private _txCode: Uint8Array | undefined;
  private _vpCode: Uint8Array | undefined;
  private _client: AnomaClient | undefined;

  public async init(): Promise<Account> {
    // initialize tx wasm
    const txResults = await fetch(`/wasm/${TxWasm.InitAccount}`);
    const txWasm = await txResults.arrayBuffer();
    this._txCode = new Uint8Array(txWasm);

    // initialize vp wasm
    const vpResults = await fetch(`/wasm/${VpWasm.User}`);
    const vpWasm = await vpResults.arrayBuffer();
    this._vpCode = new Uint8Array(vpWasm);

    this._client = await new AnomaClient().init();
    return this;
  }

  public async initialize({
    token = Tokens["NAM"].address || "",
    privateKey,
    epoch,
  }: {
    token?: string;
    privateKey: string;
    epoch: number;
  }): Promise<{ hash: string; bytes: Uint8Array }> {
    return await this._client?.account.init(
      privateKey, // Signing key
      token, // token address string
      epoch, // Epoch
      0, // Gas limit multiplier
      0, // Fee amount
      this._txCode || new Uint8Array(), // Transaction wasm
      this._vpCode || new Uint8Array() // Validity-Predicate wasm
    );
  }
}

export default Account;
