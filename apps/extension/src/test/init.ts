import { KVStore } from "@anoma/storage";
import { Chain } from "@anoma/types";

import {
  ExtensionRouter,
  ExtensionMessengerMock,
  ExtensionRequester,
} from "../extension";
import { Ports, KVPrefix } from "../router";
import { chains } from "../config";
import { ChainsService, init as initChains } from "../background/chains";
import {
  KeyRingService,
  init as initKeyRing,
  KeyStore,
} from "../background/keyring";
import { Anoma } from "provider";

class KVStoreMock<T> implements KVStore<T> {
  private storage: { [key: string]: T | null } = {};

  constructor(private readonly _prefix: string) {}

  get(key: string): Promise<T | undefined> {
    return Promise.resolve(this.storage[key] || undefined);
  }
  set(key: string, data: T | null): Promise<void> {
    this.storage[key] = data;
    return Promise.resolve();
  }
  prefix(): string {
    return this._prefix;
  }
}

export const init = (): {
  anoma: Anoma;
  iDBStore: KVStoreMock<any>;
  extStore: KVStoreMock<unknown>;
} => {
  const messenger = new ExtensionMessengerMock();

  // TODO: any for now - needs a change to KVStore interface
  const iDBStore = new KVStoreMock<any>(KVPrefix.IndexedDB);
  const extStore = new KVStoreMock<number>(KVPrefix.IndexedDB);
  const requester = new ExtensionRequester(messenger, extStore);

  const router = new ExtensionRouter(
    () => ({
      isInternalMsg: true,
      requestInteraction: () => {
        throw new Error("Test env doesn't support `requestInteraction`");
      },
    }),
    messenger,
    extStore
  );

  const chainsService = new ChainsService(iDBStore, chains);
  const keyRingService = new KeyRingService(iDBStore);

  // Initialize messages and handlers
  initChains(router, chainsService);
  initKeyRing(router, keyRingService);

  router.listen(Ports.Background);

  const version = "0.1.0";
  const anoma = new Anoma(version, requester);

  return {
    anoma,
    iDBStore,
    extStore
  };
};
