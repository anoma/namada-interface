import browser from "webextension-polyfill";
import { createContext, useContext, useEffect, useState } from "react";

import { ExtensionKVStore } from "@anoma/storage";
import {
  ExtensionMessenger,
  ExtensionRequester,
  getAnomaRouterId,
} from "extension";
import { KVPrefix } from "router";

const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const messenger = new ExtensionMessenger();

const RequesterContext = createContext<ExtensionRequester | null>(null);

export const RequesterProvider: React.FC = ({ children }) => {
  const [requester, setRequester] = useState<ExtensionRequester>();

  useEffect(() => {
    const getRequester = async (): Promise<void> => {
      const routerId = await getAnomaRouterId(store);
      const requester = new ExtensionRequester(messenger, routerId);
      setRequester(requester);
    };
    getRequester();
  }, []);

  return (
    <>
      {requester ? (
        <RequesterContext.Provider value={requester}>
          {children}
        </RequesterContext.Provider>
      ) : null}
    </>
  );
};

export const useRequester = (): ExtensionRequester => {
  const requesterContext = useContext(RequesterContext);

  if (!requesterContext) {
    throw new Error(
      "requesterContext has to be used within <RequesterContext.Provider>"
    );
  }

  return requesterContext;
};
