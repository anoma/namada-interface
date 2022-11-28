import initWasm, { InitOutput } from "./crypto/crypto";
import wasm from "./crypto/crypto_bg.wasm";

export const init: () => Promise<InitOutput> = async () => await initWasm(wasm);
