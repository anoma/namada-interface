import { init as initCrypto, AEAD, Bip44, Mnemonic } from "@anoma/crypto";
import { init as initShared, Tx, WrapperTx } from "@anoma/shared";

export class Wasm {
  public readonly crypto = {
    aead: AEAD,
    bip44: Bip44,
    mnemonic: Mnemonic,
  };

  public readonly shared = {
    tx: Tx,
    wrapperTx: WrapperTx,
  };

  public async init() {
    await initCrypto();
    await initShared();
    return this;
  }
}
