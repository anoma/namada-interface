import initWasm, { InitOutput } from "./crypto/crypto";

//@ts-ignore
import wasm from "./crypto/crypto_bg.wasm?url";

export const init: () => Promise<InitOutput> = async () => await initWasm(wasm);
