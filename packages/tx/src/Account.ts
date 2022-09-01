import { AnomaClient } from "@anoma/wasm";
import { Tokens } from "@anoma/tx";

class Account {
  private _client: AnomaClient | undefined;

  constructor(
    private readonly _txCode: Uint8Array,
    private readonly _vpCode: Uint8Array
  ) {}

  public async init(): Promise<Account> {
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
