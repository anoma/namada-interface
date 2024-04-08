import * as crypto from "@namada/crypto";
// We have to use relative improts here othewise ts-patch is getting confused and produces wrong paths after compialtion
import { initThreadPool } from "../../shared/src/init-thread-pool";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoMemory = (crypto as any).__wasm.memory;

/**
 * Initialize the SDK memory
 * @returns - The SDK crypto memory
 */
export default function init(): {
  cryptoMemory: WebAssembly.Memory;
} {
  return { cryptoMemory };
}

/**
 * Initialize the SDK memory, with multicore support.
 * If you built wasm without multicore support, this will work as regular init.
 * @async
 * @returns - The SDK crypto memory
 */
export async function initMulticore(): Promise<{
  cryptoMemory: WebAssembly.Memory;
}> {
  const res = init();
  await initThreadPool(navigator.hardwareConcurrency);
  return res;
}
