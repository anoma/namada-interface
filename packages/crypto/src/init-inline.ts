import initWasm, { InitOutput } from "./crypto/crypto";

// @ts-expect-error https://vitejs.dev/guide/features#fetching-the-module-in-node-js
import wasm from "./crypto/crypto_bg.wasm?url";

export const init: () => Promise<InitOutput> = async () => await initWasm(wasm);
