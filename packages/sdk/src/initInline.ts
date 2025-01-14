// We have to use relative imports here othewise ts-patch is getting confused and produces wrong paths after compilation
import { init as initCrypto } from "../../crypto/src/init-inline";
import { init as initShared } from "../../shared/src/init-inline";
import { initThreadPool } from "../../shared/src/init-thread-pool";

/**
 * Initialize the SDK memory
 * @async
 * @returns
 
 - The SDK crypto memory
 */
export default async function init(): Promise<{
  cryptoMemory: WebAssembly.Memory;
}> {
  // Load and initialize shared wasm
  await initShared();
  // Load and initialize crypto wasm
  const { memory: cryptoMemory } = await initCrypto();
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
  const res = await init();
  await initThreadPool(navigator.hardwareConcurrency);
  return res;
}
