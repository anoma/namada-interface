import {
  Mnemonic as MnemonicWasm,
  PhraseSize,
  StringPointer,
  readVecStringPointer,
  readVecU8Pointer,
} from "@namada/crypto";

export { PhraseSize } from "@namada/crypto";

/**
 * Class for accessing mnemonic functionality from wasm
 */
export class Mnemonic {
  /**
   * @param cryptoMemory - Memory accessor for crypto lib
   */
  constructor(protected readonly cryptoMemory: WebAssembly.Memory) {}

  /**
   * Generate a new 12 or 24 word mnemonic
   * @async
   * @param [size] Mnemonic length
   * @returns Promise that resolves to array of words
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
   * @param phrase - Mnemonic phrase
   * @param [passphrase] Bip39 passphrase
   * @returns Seed bytes
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
   * @param phrase - Mnemonic phrase
   * @returns Object with validation result and error message if invalid
   */
  validateMnemonic(phrase: string): { isValid: boolean; error?: string } {
    const isValid = MnemonicWasm.validate(phrase);
    try {
      MnemonicWasm.from_phrase(phrase);

      return { isValid };
    } catch (e) {
      // Throw exception in order to provide reason to client
      return { isValid, error: `${e}` };
    }
  }
}
