import {
  Mnemonic as MnemonicWasm,
  PhraseSize,
  StringPointer,
  readVecStringPointer,
  readVecU8Pointer,
} from "@namada/crypto";

export class Mnemonic {
  constructor(protected readonly cryptoMemory: WebAssembly.Memory) { }

  /**
   * Generate a new 12 or 24 word mnemonic
   *
   * @param {PhraseSize} size
   *
   * @return {string[]}
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
   *
   * @param {string} phrase
   * @param {string} passphrase (Optional - Bip39 passphrase)
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
   * for failure
   *
   * @param {string} phrase
   *
   * @return {boolean}
   */
  validateMnemonic(phrase: string): boolean {
    const isValid = MnemonicWasm.validate(phrase);

    try {
      MnemonicWasm.from_phrase(phrase);
    } catch (e) {
      throw new Error(`${e}`);
    }

    return isValid || false;
  }
}
