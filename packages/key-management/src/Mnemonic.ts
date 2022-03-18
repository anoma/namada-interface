import { AnomaClient } from "@anoma-apps/anoma-lib";

export enum MnemonicLength {
  Twelve = 12,
  TwentyFour = 24,
}

export class Mnemonic {
  value = "";

  constructor(mnemonicFromString?: string) {
    if (mnemonicFromString) {
      this.value = mnemonicFromString;
      return;
    }
  }

  static fromMnemonic = async (
    length: MnemonicLength,
    mnemonicFromString?: string
  ): Promise<Mnemonic> => {
    const { generateMnemonic } = await new AnomaClient().init();
    const value = mnemonicFromString
      ? mnemonicFromString
      : generateMnemonic(length);

    return new Mnemonic(value);
  };

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
}
