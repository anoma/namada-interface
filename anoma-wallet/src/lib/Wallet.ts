import { toHex } from "@cosmjs/encoding";
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
  address?: string;
  wif?: string;
  privateKey?: string;
  publicKey?: string;
};

type Path = {
  type: number;
  account?: number;
  change?: number;
  index?: string;
};

class Wallet {
  private _mnemonic: string;
  private _wallet: WalletType | undefined;
  private _tokenType: TokenType;

  constructor(mnemonic: string, token: TokenType) {
    this._mnemonic = mnemonic;
    this._tokenType = token;
  }

  public async init(): Promise<Wallet> {
    const anoma = await new AnomaClient().init();

    this._wallet = anoma.wallet.new(this._mnemonic, "");
    return this;
  }

  /**
   * Derive a new child account using mnemonic. This
   * uses hardened address by default.
   *
   * NOTE: A "child" account is represented as a
   * set of Bip32 keys derived from our root account.
   */
  public new(index: number, isHardened = true): Bip32Keys {
    const { type } = Tokens[this._tokenType];
    const path = Wallet.makePath({
      type,
      index: `${index}${isHardened ? "'" : ""}`,
    });

    const childAccount = this._wallet?.extended_keys(path);
    const {
      xpriv,
      xpub,
      address,
      wif,
      private_key: privateKey,
      public_key: publicKey,
    } = childAccount;

    const child: Bip32Keys = {
      xpriv,
      xpub,
      address,
      wif,
      privateKey: toHex(privateKey),
      publicKey: toHex(publicKey),
    };

    return child;
  }

  /**
   * Get Account Extended Keys
   */
  public get account(): Bip32Keys {
    const path = Wallet.makePath({
      type: Tokens[this._tokenType].type,
    });
    const { xpriv, xpub }: Bip32Keys = this._wallet?.extended_keys(path);

    return {
      xpriv,
      xpub,
    };
  }

  /**
   * Get Bip32 Extended Private and Public keys
   */
  public get extended(): Bip32Keys {
    const path = Wallet.makePath({
      type: Tokens[this._tokenType].type,
      change: 0,
    });
    const { xpriv, xpub }: Bip32Keys = this._wallet?.extended_keys(path);

    return {
      xpriv,
      xpub,
    };
  }

  /**
   * Get serialized Wallet struct data
   */
  public get serialized(): WalletData {
    return this._wallet?.serialize();
  }

  /**
   * Get seed as a hexadecimal value
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
   * "change" can be nullified if wanting to generate Account-level
   * keys, e.g., a path of m/44'/0'/0'
   *
   * NOTE:
   * 0 = 0,
   * 0' = 2147483648
   */
  public static makePath({
    type = 0,
    account = 0,
    change,
    index,
  }: Path): string {
    let path = `m/44'/${type}'/${account}'`;

    if (index) {
      path += `/${change ? change : 0}/${index}`;
    } else if (typeof change === "number") {
      path += `/${change}`;
    }

    return path;
  }

  /**
   * Switch instance to a different token
   */
  public set tokenType(tokenType: TokenType) {
    this._tokenType = tokenType;
  }

  /**
   * Switch instance to a different mnemonic
   */
  public set mnemonic(mnemonic: string) {
    this._mnemonic = mnemonic;
  }
}

export default Wallet;
