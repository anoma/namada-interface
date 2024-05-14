import { AtomWithQueryResult } from "jotai-tanstack-query";

export const atomsAreFetching = (...args: AtomWithQueryResult[]): boolean => {
  return args.reduce((prev, current) => prev || current.isLoading, false);
};

export const atomsAreLoaded = (...args: AtomWithQueryResult[]): boolean => {
  return args.reduce((prev, current) => prev && current.isSuccess, true);
};
