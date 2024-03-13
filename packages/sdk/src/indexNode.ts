import { webcrypto } from "node:crypto";
export * from "./index";

export { default as initSync } from "./initSync";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).crypto = webcrypto;
