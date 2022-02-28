import { generate_mnemonic } from "./lib/anoma_wasm.js";

export enum MnemonicLength {
  Twelve = 12,
  TwentyFour = 24,
}

export class Mnemonic {
  readonly value: string;
  constructor(length: MnemonicLength) {
    this.value = generate_mnemonic(length);
  }
}
