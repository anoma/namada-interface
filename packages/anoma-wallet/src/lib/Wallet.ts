import { toHex } from "@cosmjs/encoding";
import base58 from "bs58";
import { Tokens, TokenType } from "constants/";
import {
  AnomaClient,
  Result,
  ResultType,
  Wallet as WalletType,
} from "@namada-interface/anoma-lib";

type Encoding = "hex" | "base58" | null;

export type DerivedAccount = {
  address: string;
  wif: string;
  privateKey: string | Uint8Array;
  publicKey: string | Uint8Array;
  secret: string;
  public: string;
};

export type ExtendedKeys = {
  xpriv: string;
  xpub: string;
};

type PathOptions = {
  type: number;
  account?: number;
  change?: number;
  index?: string;
};

// Serialized Wallet data from WASM
type WalletData = {
  root_key: string;
  seed: number[];
  phrase: string;
  password: string;
};

// Serialized Derived Account data from WASM
type DerivedAccountData = {
  address: string;
  wif: string;
  private_key: Uint8Array;
  public_key: Uint8Array;
  // ed25519 secret & public
  secret: Uint8Array;
  public: Uint8Array;
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
  public deriveChildAccount(
    account: number,
    index: number,
    encoding: Encoding = "hex",
    isHardened = true
  ): DerivedAccount {
    const { type } = Tokens[this._tokenType];

    const path = Wallet.makePath({
      type,
      account,
      index: `${index}${isHardened ? "'" : ""}`,
    });

    const result: Result<DerivedAccountData> = this._wallet?.account(path);
    const error = result[ResultType.Err];

    if (error) {
      throw new Error(error);
    }

    const {
      address,
      wif,
      private_key: privateKey,
      public_key: publicKey,
      secret,
      public: pk,
    } = result[ResultType.Ok];

    let encodedPrivateKey;
    let encodedPublicKey;

    switch (encoding) {
      case "hex": {
        encodedPrivateKey = toHex(privateKey);
        encodedPublicKey = toHex(publicKey);
        break;
      }
      case "base58": {
        encodedPrivateKey = base58.encode(privateKey);
        encodedPublicKey = base58.encode(publicKey);
        break;
      }
      default: {
        encodedPrivateKey = privateKey;
        encodedPublicKey = publicKey;
      }
    }

    const child: DerivedAccount = {
      address,
      wif,
      privateKey: encodedPrivateKey,
      publicKey: encodedPublicKey,
      secret: toHex(secret),
      public: toHex(pk),
    };

    return child;
  }

  /**
   * Get Account Extended Private and Public Keys
   */
  public get account(): ExtendedKeys {
    const { type } = Tokens[this._tokenType];
    const path = Wallet.makePath({ type });

    const result: Result<ExtendedKeys> = this._wallet?.extended_keys(path);
    const error = result[ResultType.Err];

    if (error) {
      throw new Error(error);
    }

    const { xpriv, xpub }: ExtendedKeys = result[ResultType.Ok];

    return {
      xpriv,
      xpub,
    };
  }

  /**
   * Get Bip32 Extended Private and Public keys
   */
  public get extended(): ExtendedKeys {
    const { type } = Tokens[this._tokenType];
    const path = Wallet.makePath({
      type,
      change: 0,
    });

    const result: Result<ExtendedKeys> = this._wallet?.extended_keys(path);
    const error = result[ResultType.Err];

    if (error) {
      throw new Error(error);
    }

    const { xpriv, xpub }: ExtendedKeys = result[ResultType.Ok];

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
   * The index can be passed to the wasm to generate sub-accounts:
   * - m/44'/0'/0'/0/0'
   * - m/44'/0'/0'/0/1'
   * - m/44'/0'/0'/0/2', etc.
   *
   * "change" can be omitted if wanting to generate Account-level
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
  }: PathOptions): string {
    let path = `m/44'/${type}'/${account}'`;

    if (index) {
      path += `/${change ? change : 0}/${index}`;
    } else if (typeof change === "number") {
      path += `/${change}`;
    }

    return path;
  }
}

export default Wallet;
