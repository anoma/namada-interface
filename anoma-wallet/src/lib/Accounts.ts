import { fromBase64 } from "@cosmjs/encoding";
import * as bs58 from "bs58";
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
    const path = Accounts.makePath(type);

    const childAccount = this._client?.account.derive(
      this._mnemonic,
      "", // Password ???
      path,
      index
    );

    const { secret, address, public_key } = childAccount;

    const child = {
      secret: bs58.encode(new Uint8Array(secret)), // 32
      address: bs58.encode(address), // 20
      public: bs58.encode(fromBase64(public_key)), // 64
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

  // Create a path similar to: m/44'/0'/0'/0
  // NOTE:
  // 0 = 0
  // 0' = 2147483648
  public static makePath(type = 0, account = 0, change = 0): string {
    return `m/44'/${type}'/${account}'/${change}`;
  }
}

export default Accounts;
