import { chainParametersAtom } from "atoms/chain";
import { allProposalsAtom, votedProposalsAtom } from "atoms/proposals";
import { indexerCrawlersInfoAtom } from "atoms/settings/atoms";
import { allValidatorsAtom, myValidatorsAtom } from "atoms/validators";
import { atom } from "jotai";

export const isQuerySyncing = (q: {
  isFetching: boolean;
  isSuccess: boolean;
  isError: boolean;
}): boolean => (q.isFetching && !q.isSuccess) || (q.isError && q.isFetching);

export const indexerRequestsSyncStatusAtom = atom((get) => {
  const queries = [
    // Staking
    get(myValidatorsAtom),
    get(allValidatorsAtom),

    // Governance
    get(allProposalsAtom),
    get(votedProposalsAtom),
  ];

  // Change the logic here to only consider a query as "syncing" if:
  // 1. It's fetching AND not yet successful (initial load) OR
  // 2. It's in an error state and fetching (trying to recover)
  const isSyncing = queries.some((q) => isQuerySyncing(q));
  const isError = queries.some((q) => q.isError);
  const errors = queries.filter((q) => q.isError).map((q) => q.error);

  return {
    isSyncing,
    isError,
    errors,
  };
});

export const indexerServicesSyncStatusAtom = atom((get) => {
  const servicesTimestamps = get(indexerCrawlersInfoAtom);
  const chainParams = get(chainParametersAtom);

  if (servicesTimestamps.isSuccess && chainParams.isSuccess) {
    const { maxBlockTime } = chainParams.data;
    // Milliseconds to seconds
    const timeNow = Date.now() / 1000;

    const { isError, services } = servicesTimestamps.data
      // We ignore the following services: ["rewards", "governance"]
      // The reason is that processing that these service do takes a long time,
      // during which we are not updating the timestamps.
      // TODO: change this after implementing additional logic in the indexer
      .filter((s) => !["rewards", "governance"].includes(s.name))
      .map((s) => {
        // We leave some margin for error
        const inSync = s.timestamp > timeNow - 3 * maxBlockTime;

        return {
          name: s.name,
          inSync,
        };
      })
      .reduce(
        (acc, curr) => {
          const isError = acc.isError || !curr.inSync;
          return {
            isError,
            services:
              !curr.inSync ? [...acc.services, curr.name] : acc.services,
          };
        },
        { isError: false, services: [] } as {
          isError: boolean;
          services: string[];
        }
      );

    return {
      isSyncing: false,
      isError,
      services,
    };
  }

  return {
    isSyncing: servicesTimestamps.isFetching || chainParams.isFetching,
    isError: servicesTimestamps.isError || chainParams.isError,
    services: [],
  };
});
