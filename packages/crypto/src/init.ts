import initWasm, { InitInput, InitOutput } from "./crypto/crypto";

export const init: (wasm: InitInput) => Promise<InitOutput> = async (wasm) =>
  await initWasm(wasm);
