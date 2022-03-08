import { fromBase64, toHex } from "@cosmjs/encoding";
import { Tokens, TokenType } from "constants/";
import AnomaClient from "./AnomaClient";

type ChildAccount = {
  secret: string;
  address: string;
  public: string;
};

type AccountType = {
  [type: number]: ChildAccount[];
};

class Accounts {
  private _mnemonic: string;
  private _client: AnomaClient | undefined;
  private _accounts: AccountType = {};

  constructor(mnemonic: string) {
    this._mnemonic = mnemonic;
  }

  public async init(): Promise<Accounts> {
    this._client = await new AnomaClient().init();
    return this;
  }

  public new(token: TokenType): ChildAccount {
    const { type } = Tokens[token];
    if (!this._accounts[type]) {
      this._accounts[type] = [];
    }

    const index = this._accounts[type].length;
    const childAccount = this._client?.account.derive(
      this._mnemonic,
      "", // Password ???
      Accounts.makePath(type, 0, 0, index),
      `${index}`
    );

    const { secret, address, public_key } = childAccount;

    const child = {
      secret: toHex(new Uint8Array(secret)),
      address: toHex(fromBase64(address)),
      public: toHex(fromBase64(public_key)),
    };

    this._accounts[type].push(child);

    return child;
  }

  public get accounts(): AccountType {
    return this._accounts;
  }

  public get seed(): string {
    return this._client?.account.seed_from_mnemonic(this._mnemonic, "");
  }

  public static makePath(
    type: number,
    account: number,
    change: number,
    index: number
  ): string {
    return `m/44'/${type}'/${account}'/${change}/${index}`;
  }
}

export default Accounts;
