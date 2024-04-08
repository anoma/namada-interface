import initWasm, { InitOutput } from "./shared/shared";
//@ts-expect-error https://vitejs.dev/guide/features#fetching-the-module-in-node-js
import wasm from "./shared/shared_bg.wasm?url";

export const init: () => Promise<InitOutput> = async () => await initWasm(wasm);
