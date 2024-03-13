/* !!!Make sure that indexNode.ts and indexWeb.ts always have the same API !!! */

import { Sdk } from "@namada/shared";
export * from "./index";

export { default as initAsync } from "./initAsync";

export const initSync = async (): Promise<Sdk> => {
  throw new Error("initSync is not supported in the browser");
};
