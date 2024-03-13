/* !!!Make sure that indexNode.ts and indexWeb.ts always have the same API !!! */

import { Sdk } from "@namada/shared";
import { webcrypto } from "node:crypto";
export * from "./index";

export { default as initSync } from "./initSync";

export const initAsync = async (): Promise<Sdk> => {
  throw new Error("initAsync is not supported in Node.js");
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).crypto = webcrypto;
