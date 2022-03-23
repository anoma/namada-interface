import { AnomaClient } from "@anoma-apps/anoma-lib";
import { toBase64, fromBase64 } from "@cosmjs/encoding";

export enum MnemonicLength {
  Twelve = 12,
  TwentyFour = 24,
}

export class Mnemonic {
  value: string;

  constructor(mnemonicFromString = "") {
    this.value = mnemonicFromString;
  }

  static async fromMnemonic(
    length: MnemonicLength,
    mnemonicFromString?: string
  ): Promise<Mnemonic> {
    const { mnemonic } = await new AnomaClient().init();
    const value = mnemonicFromString
      ? mnemonicFromString
      : mnemonic.new(length).phrase();

    return new Mnemonic(value);
  }

  static fromString(fromString: string): Mnemonic {
    let mnemonicLength: MnemonicLength;
    switch (fromString.split(" ").length) {
      case 12:
        mnemonicLength = MnemonicLength.Twelve;
        break;
      case 24:
        mnemonicLength = MnemonicLength.TwentyFour;
        break;
      default:
        throw new Error("Invalid number of words in the mnemonic");
    }
    const self = new Mnemonic(fromString);
    return self;
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
    const wasmMnemonic = mnemonic.from_phrase(this.value);

    return toBase64(wasmMnemonic.to_encrypted(password));
  }
}
