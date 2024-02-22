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
import { Address, Keypair, ShieldedKeys } from "keys/types";

const DEFAULT_PATH: Bip44Path = {
  account: 0,
  change: 0,
  index: 0,
};

export class Keys {
  constructor(protected readonly cryptoMemory: WebAssembly.Memory) { }

  /**
   * Get address and public key from private key
   *
   * @param {string} privateKey
   *
   * @return {Address}
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
   * Get keypair from private key
   *
   * @param {string} privateKey
   *
   * @return {Keypair}
   */
  fromPrivateKey(privateKey: string): Keypair {
    return {
      ...this.getAddress(privateKey),
      privateKey,
    };
  }

  /**
   * Derive keypair and address from a mnemonic and path
   *
   * @param {string} phrase
   * @param {Bip44Path} path (optional)
   * @param {string} passphrase (optional) - Bip39 passphrase
   *
   * @return {Keypair}
   */
  deriveFromMnemonic(
    phrase: string,
    path: Bip44Path = DEFAULT_PATH,
    passphrase?: string
  ): Keypair {
    const mnemonic = MnemonicWasm.from_phrase(phrase);
    const passphrasePtr =
      typeof passphrase === "string"
        ? new StringPointer(passphrase)
        : undefined;
    const seed = mnemonic.to_seed(passphrasePtr);
    const hdWallet = new HDWallet(seed);
    const bip44Path = makeBip44PathArray(chains.namada.bip44.coinType, path);
    const key = hdWallet.derive(new Uint32Array(bip44Path));
    const privateKeyStringPtr = key.to_hex();
    const privateKey = readStringPointer(
      privateKeyStringPtr,
      this.cryptoMemory
    );

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
   * Derive keypair and address from a seed and path
   *
   * @param {Uint8Array} seed
   * @param {Bip44Path} path (optional)
   *
   * @return {Key}
   */
  deriveFromSeed(seed: Uint8Array, path: Bip44Path = DEFAULT_PATH): Keypair {
    const hdWallet = HDWallet.from_seed(seed);
    const bip44Path = makeBip44PathArray(chains.namada.bip44.coinType, path);
    const key = hdWallet.derive(new Uint32Array(bip44Path));
    const privateKeyStringPtr = key.to_hex();
    const privateKey = readStringPointer(
      privateKeyStringPtr,
      this.cryptoMemory
    );

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
   *
   * @param {Uint8Array} seed
   * @param {Bip44Path} path (optional)
   *
   * @return {ShieldedKeys}
   */
  deriveShielded(seed: Uint8Array, path: Bip44Path): ShieldedKeys {
    const { index } = path;
    const zip32 = ShieldedHDWallet.from_seed(seed);
    const account = zip32.derive_to_serialized_keys(index);

    // Retrieve serialized types from wasm
    const xsk = account.xsk();
    const xfvk = account.xfvk();
    const payment_address = account.payment_address();

    // Deserialize and encode keys and address
    const extendedSpendingKey = new ExtendedSpendingKey(xsk);
    const extendedViewingKey = new ExtendedViewingKey(xfvk);
    const address = new PaymentAddress(payment_address).encode();
    const spendingKey = extendedSpendingKey.encode();
    const viewingKey = extendedViewingKey.encode();

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
