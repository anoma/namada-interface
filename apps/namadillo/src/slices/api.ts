import { DefaultApi } from "@anomaorg/namada-indexer-client";
import { Atom, atom, getDefaultStore } from "jotai";
import { indexerUrlAtom } from "./settings";

export const indexerApiAtom = atom<DefaultApi>((get) => {
  return getApi(get);
});

export const getIndexerApi = (): DefaultApi => {
  const { get } = getDefaultStore();
  return getApi(get);
};

// Helper function to use outside of hooks
const getApi = (get: <Value>(atom: Atom<Value>) => Value): DefaultApi => {
  const indexerUrl = get(indexerUrlAtom);
  return new DefaultApi({ basePath: indexerUrl });
};
