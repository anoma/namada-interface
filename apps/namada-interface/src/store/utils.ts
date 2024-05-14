import { AtomWithQueryResult } from "jotai-tanstack-query";

export const atomsArePending = (...args: AtomWithQueryResult[]): boolean => {
  return args.reduce((prev, current) => prev || current.isPending, false);
};

export const atomsAreLoaded = (...args: AtomWithQueryResult[]): boolean => {
  return args.reduce((prev, current) => prev && current.isSuccess, true);
};
