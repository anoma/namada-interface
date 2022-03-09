import { toHex } from "@cosmjs/encoding";
import bs58 from "bs58";
import { Tokens, TokenType } from "constants/";
import AnomaClient, { WalletType } from "./AnomaClient";

type WalletData = {
  root_key: string;
  xpriv: string;
  xpub: string;
  seed: number[];
  phrase: string;
  password: string;
};

type ChildAccount = {
  xpriv: string;
  xpub: string;
  privateKey: string;
  publicKey: string;
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
    const {
      xpriv,
      xpub,
      private_key: privateKey,
      public_key: publicKey,
    } = childAccount;

    const child: ChildAccount = {
      xpriv,
      xpub,
      privateKey: bs58.encode(privateKey),
      publicKey: toHex(publicKey),
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

  public get serialized(): WalletData {
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
