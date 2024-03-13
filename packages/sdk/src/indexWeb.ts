export * from "./index";

export { default as initAsync } from "./initAsync";

export const initSync = async (): Promise<void> => {
  throw new Error("initSync is not supported in the browser");
};
