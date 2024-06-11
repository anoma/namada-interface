import { DefaultApi } from "@anomaorg/namada-indexer-client";
import { Atom, atom, createStore } from "jotai";
import { namadilloSettingsAtom } from "./settings";

export const indexerApiAtom = atom<DefaultApi>((get) => {
  return getApi(get);
});

export const getIndexerApi = (): DefaultApi => {
  const { get } = createStore();

  return getApi(get);
};

// Helper function to use outside of hooks
const getApi = (get: <Value>(atom: Atom<Value>) => Value): DefaultApi => {
  const { indexerUrl } = get(namadilloSettingsAtom);

  return new DefaultApi({ basePath: indexerUrl });
};
