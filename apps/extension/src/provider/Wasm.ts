import { init as initCrypto, AEAD, Bip44, Mnemonic } from "@anoma/crypto";

export class Wasm {
  public readonly crypto = {
    aead: AEAD,
    bip44: Bip44,
    mnemonic: Mnemonic,
  };

  public async init() {
    await initCrypto();
    return this;
  }
}
