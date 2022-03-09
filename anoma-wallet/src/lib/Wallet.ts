import { toHex } from "@cosmjs/encoding";
import * as bs58 from "bs58";
import { Tokens, TokenType } from "constants/";
import AnomaClient, { WalletType } from "./AnomaClient";

type ChildAccount = {
  secret: string;
  address: string;
  public: string;
};

type AccountType = {
  [type: number]: ChildAccount[];
};

class Wallet {
  private _mnemonic: string;
  private _client: AnomaClient | undefined;
  private _wallet: WalletType | undefined;
  private _accounts: AccountType = {};
  private _token: TokenType;

  constructor(mnemonic: string, token: TokenType) {
    this._mnemonic = mnemonic;
    this._token = token;
  }

  public async init(): Promise<Wallet> {
    this._client = await new AnomaClient().init();

    this._wallet = this._client.wallet.new(
      this._mnemonic,
      "",
      Wallet.makePath({ type: Tokens[this._token].type })
    );
    return this;
  }

  /**
   * Derive a new child account using mnemonic
   */
  public new(isHardened = true): ChildAccount {
    const { type } = Tokens[this._token];
    if (!this._accounts[type]) {
      this._accounts[type] = [];
    }

    const index = `${this._accounts[type].length}${isHardened ? "'" : ""}`;
    const path = Wallet.makePath({ type });

    const childAccount = this._wallet?.derive(path, index);
    console.log({ childAccount });
    const { secret, address, public_key } = childAccount;

    const child = {
      secret: bs58.encode(secret), // 32
      address: bs58.encode(address), // 20
      public: toHex(public_key), // 64
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

  public get serialized(): WalletType {
    return this._wallet?.serialize();
  }

  public get seed(): string {
    const wallet = this._wallet?.serialize();
    return toHex(new Uint8Array(wallet.seed));
  }

  /**
   * Creates a derivation path: m/44'/0'/0'/0
   * The index is later passed to the wasm to generate sub-accounts:
   * - m/44'/0'/0'/0/0'
   * - m/44'/0'/0'/0/1'
   * - m/44'/0'/0'/0/2', etc.
   *
   * NOTE:
   * 0 = 0,
   * 0' = 2147483648
   */
  public static makePath({ type = 0, account = 0, change = 0 }): string {
    return `m/44'/${type}'/${account}'/${change}`;
  }
}

export default Wallet;
