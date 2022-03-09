import { toHex } from "@cosmjs/encoding";
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

  /**
   * Derive a new child account using mnemonic
   */
  public new(token: TokenType, isHardened = true): ChildAccount {
    const { type } = Tokens[token];
    if (!this._accounts[type]) {
      this._accounts[type] = [];
    }

    const index = `${this._accounts[type].length}${isHardened ? "'" : ""}`;
    const path = Accounts.makePath(type);

    const childAccount = this._client?.account.derive(
      this._mnemonic,
      "", // Password ???
      path,
      index
    );

    const { secret, address, public_key, xpriv } = childAccount;

    const child = {
      secret: bs58.encode(secret), // 32
      address: bs58.encode(address), // 20
      public: toHex(public_key), // 64
      xpriv: bs58.encode(xpriv), // 32
    };

    this._accounts[type].push(child);

    return child;
  }

  /**
   * Get all accounts from instance
   */
  public get accounts(): AccountType {
    return this._accounts;
  }

  /**
   * Get the hexadecimal seed produced by the mnemonic
   */
  public get seed(): string {
    return this._client?.account.seed_from_mnemonic(this._mnemonic, "");
  }

  /**
   * Creates a derivation path: m/44'/0'/0'/0
   * The index is later passed to the wasm to generate sub-accounts:
   * - m/44'/0'/0'/0/0
   * - m/44'/0'/0'/0/1
   * - m/44'/0'/0'/0/2, etc.
   *
   * NOTE:
   * 0 = 0
   * 0' = 2147483648
   */
  public static makePath(type = 0, account = 0, change = 0): string {
    // NOTE: We are forcing purpose, coin_type, and account to use
    // prime (0', etc.) here:
    return `m/44'/${type}'/${account}'/${change}`;
  }
}

export default Accounts;
