import { init, AEAD, Bip44, Mnemonic } from "@anoma/crypto";

export class Wasm {
  constructor(
    public readonly aead: typeof AEAD,
    public readonly bip44: typeof Bip44,
    public readonly mnemonic: typeof Mnemonic
  ) {}

  public async init() {
    await init();
    return this;
  }
}
