import { Configuration, DefaultApi } from "@namada/indexer-client";
import { Atom, atom, getDefaultStore } from "jotai";
import { indexerUrlAtom } from "./settings";

const BASE_OPTIONS = { headers: {} };

export const indexerApiAtom = atom<DefaultApi>((get) => {
  return getApi(get);
});

export const getIndexerApi = (url?: string): DefaultApi => {
  const { get } = getDefaultStore();
  return getApi(get, url);
};

// Helper function to use outside of hooks
const getApi = (
  get: <Value>(atom: Atom<Value>) => Value,
  url?: string
): DefaultApi => {
  const indexerUrl = url ?? get(indexerUrlAtom);
  const configuration = new Configuration({
    basePath: indexerUrl,
    baseOptions: BASE_OPTIONS,
  });

  return new DefaultApi(configuration);
};

// This function is used to get the custom indexer API - used in the settings page
export const getCustomIndexerApi = (indexerUrl: string): DefaultApi => {
  const configuration = new Configuration({
    basePath: indexerUrl,
    baseOptions: BASE_OPTIONS,
  });

  return new DefaultApi(configuration);
};
