import {
  Mnemonic as MnemonicWasm,
  PhraseSize,
  StringPointer,
  readVecStringPointer,
  readVecU8Pointer,
} from "@namada/crypto";

/**
 * Class for accessing mnemonic functionality from wasm
 */
export class Mnemonic {
  /**
   * @param {WebAssembly.Memory} cryptoMemory - Memory accessor for crypto lib
   */
  constructor(protected readonly cryptoMemory: WebAssembly.Memory) {}

  /**
   * Generate a new 12 or 24 word mnemonic
   * @async
   * @param {PhraseSize} [size] Mnemonic length
   * @returns {Promise<string[]>} Promise that resolves to array of words
   */
  async generate(size: PhraseSize = PhraseSize.N12): Promise<string[]> {
    const mnemonic = new MnemonicWasm(size);

    const vecStringPointer = mnemonic.to_words();
    const words = readVecStringPointer(vecStringPointer, this.cryptoMemory);

    mnemonic.free();
    vecStringPointer.free();

    return words;
  }

  /**
   * Convert mnemonic to seed bytes
   * @param {string} phrase - Mnemonic phrase
   * @param {string} [passphrase] Bip39 passphrase
   * @returns {Uint8Array} Seed bytes
   */
  toSeed(phrase: string, passphrase?: string): Uint8Array {
    const mnemonic = MnemonicWasm.from_phrase(phrase);
    const passphrasePtr =
      typeof passphrase === "string"
        ? new StringPointer(passphrase)
        : undefined;

    const seedPtr = mnemonic.to_seed(passphrasePtr);

    return new Uint8Array(readVecU8Pointer(seedPtr, this.cryptoMemory));
  }

  /**
   * Validate a mnemonic string, raise an exception providing reason
   * for failure if invalid, otherwise return nothing
   * @param {string} phrase - Mnemonic phrase
   * @returns {void}
   */
  validateMnemonic(phrase: string): void {
    try {
      MnemonicWasm.from_phrase(phrase);
    } catch (e) {
      // Throw exception in order to provide reason to client
      throw new Error(`${e}`);
    }
  }
}
