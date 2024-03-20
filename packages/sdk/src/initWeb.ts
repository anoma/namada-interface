// We have to use relative improts here othewise ts-patch is getting confused and produces wrong paths after compialtion
import { init as initCrypto } from "../../crypto/src/init";
import { init as initShared } from "../../shared/src/init";

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
  const sharedWasm = await fetch("shared.namada.wasm").then((wasm) =>
    wasm.arrayBuffer()
  );
  await initShared(sharedWasm);

  // Load and initialize crypto wasm
  const cryptoWasm = await fetch("crypto.namada.wasm").then((wasm) =>
    wasm.arrayBuffer()
  );
  const { memory: cryptoMemory } = await initCrypto(cryptoWasm);

  return { cryptoMemory };
}
