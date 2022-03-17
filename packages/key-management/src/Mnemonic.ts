import { AnomaClient } from "@anoma-apps/anoma-lib";

export enum MnemonicLength {
  Twelve = 12,
  TwentyFour = 24,
}

export class Mnemonic {
  value = "";
  constructor(length: MnemonicLength, mnemonicFromString?: string) {
    if (mnemonicFromString) {
      this.value = mnemonicFromString;
      return;
    }
    Mnemonic.fromMnemonic(length).then(
      (mnemonic) => (this.value = mnemonic.value)
    );
  }

  static fromMnemonic = async (
    length: MnemonicLength,
    mnemonicFromString?: string
  ): Promise<Mnemonic> => {
    const { generateMnemonic } = await new AnomaClient().init();
    const self = new Mnemonic(length);
    if (mnemonicFromString) {
      self.value = mnemonicFromString;
      return self;
    }
    self.value = generateMnemonic(length);
    return self;
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
    const self = new Mnemonic(mnemonicLength, fromString);
    return self;
  }
}
