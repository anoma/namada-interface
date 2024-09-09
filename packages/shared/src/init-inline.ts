import initWasm, { InitOutput } from "./shared/shared";
// @ts-ignore
import wasm from "./shared/shared_bg.wasm?url";

export const init: () => Promise<InitOutput> = async () => await initWasm(wasm);
