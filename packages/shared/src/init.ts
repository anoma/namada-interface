import initWasm, {
  InitInput,
  InitOutput,
  initThreadPool,
} from "./shared/shared";

export const init: (wasm: InitInput) => Promise<InitOutput> = async (wasm) => {
  return await initWasm(wasm);
};

export const initMulticore: (wasm: InitInput) => Promise<InitOutput> = async (
  wasm
) => {
  const res = await initWasm(wasm);
  await initThreadPool(navigator.hardwareConcurrency);
  return res;
};
