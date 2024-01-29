import { createContext, useEffect, useState } from "react";
import browser from "webextension-polyfill";

import { ExtensionKVStore } from "@namada/storage";
import {
  ExtensionMessenger,
  ExtensionRequester,
  getNamadaRouterId,
} from "extension";
import { KVPrefix } from "router";

const store = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const messenger = new ExtensionMessenger();

export const RequesterContext = createContext<ExtensionRequester | null>(null);

export const RequesterProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [requester, setRequester] = useState<ExtensionRequester>();

  useEffect(() => {
    const getRequester = async (): Promise<void> => {
      const routerId = await getNamadaRouterId(store);
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
