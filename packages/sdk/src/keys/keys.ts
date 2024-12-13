import { chains } from "@namada/chains";
import {
  HDWallet,
  Mnemonic as MnemonicWasm,
  ShieldedHDWallet,
  StringPointer,
  readStringPointer,
} from "@namada/crypto";
import {
  Address as AddressWasm,
  ExtendedSpendingKey,
  ExtendedViewingKey,
  PaymentAddress,
  public_key_to_bech32,
} from "@namada/shared";
import { Bip44Path, Zip32Path } from "@namada/types";
import { makeBip44PathArray, makeSaplingPathArray } from "../utils";
import { Address, ShieldedKeys, TransparentKeys } from "./types";

const DEFAULT_BIP44_PATH: Bip44Path = {
  account: 0,
  change: 0,
  index: 0,
};

const DEFAULT_ZIP32_PATH: Zip32Path = {
  account: 0,
};

/**
 * Namespace for key related functions
 */
export class Keys {
  /**
   * @param cryptoMemory - Memory accessor for crypto lib
   */
  constructor(protected readonly cryptoMemory: WebAssembly.Memory) {}

  /**
   * Get address and public key from private key
   * @param privateKey - Private key
   * @returns Address and public key
   */
  getAddress(privateKey: string): Address {
    const addr = new AddressWasm(privateKey);
    const address = addr.implicit();
    const publicKey = addr.public();

    return {
      address,
      publicKey,
    };
  }

  /**
   * Get transparent keys and address from private key
   * @param privateKey - Private key
   * @returns Keys and address
   */
  fromPrivateKey(privateKey: string): TransparentKeys {
    return {
      ...this.getAddress(privateKey),
      privateKey,
    };
  }

  /**
   * Derive transparent keys and address from a mnemonic and path
   * @param phrase - Mnemonic phrase
   * @param [path] - Bip44 path object
   * @param [passphrase] - Bip39 passphrase
   * @returns Keys and address
   */
  deriveFromMnemonic(
    phrase: string,
    path: Bip44Path = DEFAULT_BIP44_PATH,
    passphrase?: string
  ): TransparentKeys {
    const mnemonic = MnemonicWasm.from_phrase(phrase);
    const passphrasePtr =
      typeof passphrase === "string" ?
        new StringPointer(passphrase)
      : undefined;
    const seedPtr = mnemonic.to_seed(passphrasePtr);
    const hdWallet = new HDWallet(seedPtr);
    const bip44Path = makeBip44PathArray(chains.namada.bip44.coinType, path);
    const key = hdWallet.derive(new Uint32Array(bip44Path));
    const privateKeyStringPtr = key.to_hex();
    const privateKey = readStringPointer(
      privateKeyStringPtr,
      this.cryptoMemory
    );

    // Clear wasm resources from memory
    mnemonic.free();
    hdWallet.free();
    key.free();
    privateKeyStringPtr.free();

    return {
      ...this.getAddress(privateKey),
      privateKey,
    };
  }

  /**
   * Derive transparent keys and address from a seed and path
   * @param seed - Seed
   * @param [path] - Bip44 path object
   * @returns Keys and address
   */
  deriveFromSeed(
    seed: Uint8Array,
    path: Bip44Path = DEFAULT_BIP44_PATH
  ): TransparentKeys {
    const hdWallet = HDWallet.from_seed(seed);
    const bip44Path = makeBip44PathArray(chains.namada.bip44.coinType, path);
    const key = hdWallet.derive(new Uint32Array(bip44Path));
    const privateKeyStringPtr = key.to_hex();
    const privateKey = readStringPointer(
      privateKeyStringPtr,
      this.cryptoMemory
    );

    // Clear wasm resources from memory
    hdWallet.free();
    key.free();
    privateKeyStringPtr.free();

    return {
      ...this.getAddress(privateKey),
      privateKey,
    };
  }

  /**
   * Derive shielded keys and address from a seed and path
   * @param seed - Seed
   * @param [bip44Path] - Bip44 path object to derive private key to seed the shielded keys
   * @param [zip32Path] - Zip32 path object to derive the shielded keys
   * @param [diversifier] - Diversifier bytes
   * @returns Shielded keys and address
   */
  deriveShieldedFromSeed(
    seed: Uint8Array,
    bip44Path: Bip44Path = DEFAULT_BIP44_PATH,
    zip32Path: Zip32Path = DEFAULT_ZIP32_PATH,
    diversifier?: Uint8Array
  ): ShieldedKeys {
    const shieldedHdWallet = new ShieldedHDWallet(
      seed,
      makeBip44PathArray(chains.namada.bip44.coinType, bip44Path)
    );
    return this.deriveFromShieldedWallet(
      shieldedHdWallet,
      zip32Path,
      diversifier
    );
  }

  /**
   * Derive shielded keys and address from private key bytes
   * @param privateKeyBytes - secret
   * @param path - Zip32 path object
   * @param diversifier - Diversifier bytes
   * @returns Shielded keys and address
   */
  deriveShieldedFromPrivateKey(
    privateKeyBytes: Uint8Array,
    path: Zip32Path = DEFAULT_ZIP32_PATH,
    diversifier?: Uint8Array
  ): ShieldedKeys {
    const shieldedHdWallet = ShieldedHDWallet.new_from_sk(privateKeyBytes);
    return this.deriveFromShieldedWallet(shieldedHdWallet, path, diversifier);
  }

  /**
   *
   * @param shieldedHdWallet - Shielded HD Wallet instance
   * @param path - Zip32 path object
   * @param diversifier - Diversifier bytes
   * @returns Object representing MASP related keys
   */
  private deriveFromShieldedWallet(
    shieldedHdWallet: ShieldedHDWallet,
    path: Zip32Path,
    diversifier?: Uint8Array
  ): ShieldedKeys {
    const { account, index } = path;
    const saplingPath = makeSaplingPathArray(877, account, index);
    const derivedAccount = shieldedHdWallet.derive(saplingPath, diversifier);

    // Retrieve serialized types from wasm
    const xsk = derivedAccount.xsk();
    const xfvk = derivedAccount.xfvk();
    const paymentAddress = derivedAccount.payment_address();

    // Deserialize and encode keys and address
    const extendedSpendingKey = new ExtendedSpendingKey(xsk);
    const extendedViewingKey = new ExtendedViewingKey(xfvk);
    const address = new PaymentAddress(paymentAddress).encode();
    const spendingKey = extendedSpendingKey.encode();
    const viewingKey = extendedViewingKey.encode();
    const pseudoExtendedKey = extendedSpendingKey
      .to_pseudo_extended_key()
      .encode();

    // Clear wasm resources from memory
    shieldedHdWallet.free();
    derivedAccount.free();
    extendedViewingKey.free();
    extendedSpendingKey.free();

    return {
      address,
      spendingKey,
      viewingKey,
      pseudoExtendedKey,
    };
  }

  /**
   * Generate a disposable transparent keypair
   * @returns Keys and address
   */
  genDisposableKeypair(): TransparentKeys {
    const key = HDWallet.disposable_keypair();
    const privateKeyStringPtr = key.to_hex();
    const privateKey = readStringPointer(
      privateKeyStringPtr,
      this.cryptoMemory
    );

    key.free();
    privateKeyStringPtr.free();

    return {
      ...this.getAddress(privateKey),
      privateKey,
    };
  }
}

//TODO: think where to put this function
export const publicKeyToBech32 = (publicKey: Uint8Array): string => {
  return public_key_to_bech32(publicKey);
};
