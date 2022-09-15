/* eslint-disable */
import initWasm, { InitOutput, Mnemonic } from "./crypto/crypto";
import wasm from "./crypto/crypto_bg.wasm";

export const init: () => Promise<InitOutput> = async () => await initWasm(wasm);

export * from "./crypto/crypto";
