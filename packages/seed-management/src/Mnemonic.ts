import { AnomaClient } from "@anoma/wasm";
import { toBase64, fromBase64 } from "@cosmjs/encoding";

export enum MnemonicLength {
  Twelve = 12,
  TwentyFour = 24,
}

export class Mnemonic {
  phrase: string;

  constructor(phrase = "") {
    this.phrase = phrase;
  }

  static async fromMnemonic(
    length: MnemonicLength,
    phrase?: string
  ): Promise<Mnemonic> {
    const { mnemonic } = await new AnomaClient().init();
    return new Mnemonic(phrase ? phrase : mnemonic.new(length).phrase());
  }

  static fromString(phrase: string): Mnemonic {
    const phraseLength = phrase.split(" ").length;
    if ([12, 24].includes(phraseLength)) {
      const self = new Mnemonic(phrase);
      return self;
    }
    throw new Error("Invalid number of words in the mnemonic");
  }

  static async fromStorageValue(
    password: string,
    encrypted: string
  ): Promise<Mnemonic> {
    const { mnemonic } = await new AnomaClient().init();
    const phrase = mnemonic
      .from_encrypted(fromBase64(encrypted), password)
      .phrase();

    return new Mnemonic(phrase);
  }

  async toStorageValue(password: string): Promise<string> {
    const { mnemonic } = await new AnomaClient().init();
    const wasmMnemonic = mnemonic.from_phrase(this.phrase);

    return toBase64(wasmMnemonic.to_encrypted(password));
  }
}
