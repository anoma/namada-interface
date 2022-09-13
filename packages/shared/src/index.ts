/* eslint-disable */
import wasm from "./shared";
/* eslint-enable */

export const init = async (): Promise<WebAssembly.Memory | null> => {
  // Support setting wasm-pack target to "nodejs" (for testing)
  // A target of "nodejs" will not generate a callable init() function
  const _init =
    typeof wasm === "function" ? wasm : () => Promise.resolve({ memory: null });
  const { memory } = await _init();
  return memory;
};

export * from "./shared";
