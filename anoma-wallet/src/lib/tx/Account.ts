import { AnomaClient } from "lib";
import { TxWasm, VpWasm } from "constants/";
import { hexToKeypair } from "utils/helpers";

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
    token,
    secret,
    epoch,
  }: {
    token: string;
    secret: string;
    epoch: number;
  }): Promise<{ hash: string; bytes: Uint8Array }> {
    // Generate a Keypair struct:
    const keypair = this._client?.keypair.deserialize(hexToKeypair(secret));

    return await this._client?.account.init(
      keypair?.serialize(), // Serialized Keypair
      token, // token address string
      epoch, // Epoch
      0, // Gas limit multiplier
      0, // Fee amount
      this._txCode || new Uint8Array(), // tx_init_account wasm byte array
      this._vpCode || new Uint8Array()
    );
  }
}

export default Account;
