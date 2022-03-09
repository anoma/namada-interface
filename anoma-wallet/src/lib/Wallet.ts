import { toHex } from "@cosmjs/encoding";
import bs58 from "bs58";
import { Tokens, TokenType } from "constants/";
import AnomaClient, { WalletType } from "./AnomaClient";

type WalletData = {
  root_key: string;
  seed: number[];
  phrase: string;
  password: string;
};

type Bip32Keys = {
  xpriv: string;
  xpub: string;
  privateKey?: string;
  publicKey?: string;
};

type AccountType = {
  [type: number]: Bip32Keys[];
};

class Wallet {
  private _mnemonic: string;
  private _wallet: WalletType | undefined;
  private _accounts: AccountType = {};
  private _token: TokenType;

  constructor(mnemonic: string, token: TokenType) {
    this._mnemonic = mnemonic;
    this._token = token;
  }

  public async init(): Promise<Wallet> {
    const anoma = await new AnomaClient().init();

    this._wallet = anoma.wallet.new(this._mnemonic, "");
    return this;
  }

  /**
   * Derive a new child account using mnemonic
   * NOTE: A "child" account is represented as a
   * set of Bip32 keys derived from our root account
   */
  public new(isHardened = true): Bip32Keys {
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

    const child: Bip32Keys = {
      xpriv,
      xpub,
      privateKey: bs58.encode(privateKey),
      publicKey: toHex(publicKey),
    };

    this._accounts[type].push(child);

    return child;
  }

  /**
   * Get Bip32 Extended Private and Public keys
   */
  public get extended(): Bip32Keys {
    const path = Wallet.makePath({
      type: Tokens[this._token].type,
    });
    const { xpriv, xpub }: Bip32Keys = this._wallet?.extended_keys(path);

    return {
      xpriv,
      xpub,
    };
  }

  /**
   * Get Account Extended Keys
   */
  public get account(): Bip32Keys {
    const path = Wallet.makePath({
      type: Tokens[this._token].type,
      change: null,
    });
    const { xpriv, xpub }: Bip32Keys = this._wallet?.extended_keys(path);

    return {
      xpriv,
      xpub,
    };
  }
  /**
   * Get all accounts from instance
   */
  public get accounts(): AccountType {
    return this._accounts;
  }

  /**
   * Get serialized Wallet struct
   * - root_key
   * - seed
   * - phrase
   * - password
   */
  public get serialized(): WalletData {
    return this._wallet?.serialize();
  }

  /**
   * Get seed as hexadecimal value
   */
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
  public static makePath({
    type = 0,
    account = 0,
    change = 0,
  }: {
    type: number;
    account?: number;
    change?: number | null;
  }): string {
    return `m/44'/${type}'/${account}'${
      change !== null ? "/" + change + "" : ""
    }`;
  }
}

export default Wallet;
