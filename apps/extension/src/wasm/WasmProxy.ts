import { init, AEAD, Bip44, Mnemonic } from "@anoma/crypto";

export class WasmProxy {
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

declare global {
  var wasm: WasmProxy;
}

export const inject = async () => {
  if (!window.wasm) {
    window.wasm = await new WasmProxy(AEAD, Bip44, Mnemonic).init();
  }
};
