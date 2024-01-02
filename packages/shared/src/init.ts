import initWasm, { InitInput, InitOutput } from "./shared/shared";

export const init: (wasm: InitInput) => Promise<InitOutput> = async (wasm) => {
  return await initWasm(wasm);
};
