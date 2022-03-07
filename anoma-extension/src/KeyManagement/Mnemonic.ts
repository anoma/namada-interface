import { generate_mnemonic } from "./lib/anoma_wasm.js";

export enum MnemonicLength {
  Twelve = 12,
  TwentyFour = 24,
}

export class Mnemonic {
  readonly value: string;
  constructor(length: MnemonicLength, mnemonicFromString?: string) {
    if (mnemonicFromString) {
      this.value = mnemonicFromString;
      return;
    }
    this.value = generate_mnemonic(length);
  }

  static fromString(fromString: string) {
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
