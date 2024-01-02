import initWasm, { InitInput, InitOutput, initThreadPool } from "./shared/mt";

export const init: (wasm: InitInput) => Promise<InitOutput> = async (wasm) => {
  const res = await initWasm(wasm);
  await initThreadPool(navigator.hardwareConcurrency);
  return res;
};
