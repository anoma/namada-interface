import { init, AEAD, Bip44, Mnemonic } from "@anoma/crypto";

class WasmProxy {
  constructor(
    protected readonly aead: typeof AEAD,
    protected readonly bip44: typeof Bip44,
    protected readonly mnemonic: typeof Mnemonic
  ) {}

  public async init() {
    await init();
    console.info("WasmProxy loaded");
    return this;
  }
}

declare global {
  var wasm: WasmProxy;
}

console.info("Initializing wasm...");

(async () => {
  if (!window.wasm) {
    window.wasm = await new WasmProxy(AEAD, Bip44, Mnemonic).init();
    console.log("window.wasm loaded", window.wasm);
  }
})();
