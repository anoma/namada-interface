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
} from "@namada/shared";
import { Bip44Path } from "@namada/types";
import { makeBip44PathArray } from "@namada/utils";
import { Address, ShieldedKeys, TransparentKeys } from "./types";

const DEFAULT_PATH: Bip44Path = {
  account: 0,
  change: 0,
  index: 0,
};

export class Keys {
  /**
   * @param {WebAssembly.Memory} cryptoMemory - Memory accessor for crypto lib
   */
  constructor(protected readonly cryptoMemory: WebAssembly.Memory) {}

  /**
   * Get address and public key from private key
   * @param {string} privateKey - Private key
   * @returns {Address} Address and public key
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
   * @param {string} privateKey - Private key
   * @returns {TransparentKeys} Keys and address
   */
  fromPrivateKey(privateKey: string): TransparentKeys {
    return {
      ...this.getAddress(privateKey),
      privateKey,
    };
  }

  /**
   * Derive transparent keys and address from a mnemonic and path
   * @param {string} phrase - Mnemonic phrase
   * @param {Bip44Path} [path] - Bip44 path object
   * @param {string} [passphrase] - Bip39 passphrase
   * @returns {TransparentKeys} Keys and address
   */
  deriveFromMnemonic(
    phrase: string,
    path: Bip44Path = DEFAULT_PATH,
    passphrase?: string
  ): TransparentKeys {
    const mnemonic = MnemonicWasm.from_phrase(phrase);
    const passphrasePtr =
      typeof passphrase === "string"
        ? new StringPointer(passphrase)
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
   * @param {Uint8Array} seed - Seed
   * @param {Bip44Path} [path] - Bip44 path object
   * @returns {TransparentKeys} Keys and address
   */
  deriveFromSeed(
    seed: Uint8Array,
    path: Bip44Path = DEFAULT_PATH
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
   * @param {Uint8Array} seed - Seed
   * @param {Bip44Path} [path] - Bip44 path object
   * @returns {ShieldedKeys} Shielded keys and address
   */
  deriveShielded(
    seed: Uint8Array,
    path: Bip44Path = DEFAULT_PATH
  ): ShieldedKeys {
    const { index } = path;
    const zip32 = ShieldedHDWallet.from_seed(seed);
    const account = zip32.derive_to_serialized_keys(index);

    // Retrieve serialized types from wasm
    const xsk = account.xsk();
    const xfvk = account.xfvk();
    const paymentAddress = account.payment_address();

    // Deserialize and encode keys and address
    const extendedSpendingKey = new ExtendedSpendingKey(xsk);
    const extendedViewingKey = new ExtendedViewingKey(xfvk);
    const address = new PaymentAddress(paymentAddress).encode();
    const spendingKey = extendedSpendingKey.encode();
    const viewingKey = extendedViewingKey.encode();

    // Clear wasm resources from memory
    zip32.free();
    account.free();
    extendedViewingKey.free();
    extendedSpendingKey.free();

    return {
      address,
      spendingKey,
      viewingKey,
    };
  }
}
