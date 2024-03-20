import * as crypto from "@namada/crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoMemory = (crypto as any).__wasm.memory;

/**
 * Initialize the SDK memory
 * @returns - The SDK crypto memory
 */
export default function init(): { cryptoMemory: WebAssembly.Memory } {
  return { cryptoMemory };
}
