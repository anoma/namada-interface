import { allValidatorsAtom, myValidatorsAtom } from "atoms/validators";
import { atom } from "jotai";

export const syncStatusAtom = atom((get) => {
  const myValidators = get(myValidatorsAtom);
  const allValidators = get(allValidatorsAtom);

  const watchedQueries = [myValidators, allValidators];

  const isSyncing = watchedQueries.some((q) => q.isFetching);
  const isError = watchedQueries.some((q) => q.isError);
  const error = watchedQueries.find((q) => q.error)?.error || undefined;

  return {
    isSyncing,
    isError,
    error,
  };
});
