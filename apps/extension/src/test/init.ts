import { KVStore } from "@anoma/storage";

import {
  ExtensionRouter,
  ExtensionMessengerMock,
  ExtensionRequester,
  getAnomaRouterId,
} from "../extension";
import { Ports, KVPrefix } from "../router";
import { chains } from "@anoma/chains";
import { ChainsService, init as initChains } from "../background/chains";
import {
  KeyRingService,
  init as initKeyRing,
  KeyStore,
  TabStore,
} from "../background/keyring";

import {
  ApprovalsService,
  init as initApprovals,
} from "../background/approvals";

import { Anoma } from "provider";
import { Chain } from "@anoma/types";
import { Query, Sdk } from "@anoma/shared";

// __wasm is not exported in crypto.d.ts so need to use require instead of import
/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@anoma/crypto").__wasm.memory;
const sharedMemory = require("@anoma/shared").__wasm.memory;
const chainId = "namada-75a7e12.69483d59a9fb174";

export class KVStoreMock<T> implements KVStore<T> {
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

export const init = async (): Promise<{
  anoma: Anoma;
  iDBStore: KVStoreMock<Chain[] | KeyStore[]>;
  extStore: KVStoreMock<number>;
  activeAccountStore: KVStoreMock<string>;
  chainsService: ChainsService;
  keyRingService: KeyRingService;
}> => {
  const messenger = new ExtensionMessengerMock();
  const iDBStore = new KVStoreMock<Chain[] | KeyStore[]>(KVPrefix.IndexedDB);
  const sdkStore = new KVStoreMock<Record<string, string>>(KVPrefix.SDK);
  const extStore = new KVStoreMock<number>(KVPrefix.IndexedDB);
  const activeAccountStore = new KVStoreMock<string>(KVPrefix.ActiveAccount);
  const connectedTabsStore = new KVStoreMock<TabStore[]>(
    KVPrefix.ConnectedTabs
  );
  const anomaRouterId = await getAnomaRouterId(extStore);
  const requester = new ExtensionRequester(messenger, anomaRouterId);
  const txStore = new KVStoreMock<string>(KVPrefix.LocalStorage);

  const router = new ExtensionRouter(
    () => ({
      isInternalMsg: true,
      senderTabId: -2,
      requestInteraction: () => {
        throw new Error("Test env doesn't support `requestInteraction`");
      },
    }),
    messenger,
    extStore
  );

  const sdk = new Sdk("");
  const query = new Query("");

  const chainsService = new ChainsService(
    iDBStore as KVStore<Chain[]>,
    Object.values(chains)
  );
  const keyRingService = new KeyRingService(
    iDBStore as KVStore<KeyStore[]>,
    sdkStore,
    activeAccountStore,
    connectedTabsStore,
    extStore,
    chainId,
    sdk,
    query,
    cryptoMemory,
    sharedMemory,
    requester
  );
  const approvalsService = new ApprovalsService(
    txStore,
    connectedTabsStore,
    keyRingService,
    chainId,
    requester
  );

  // Initialize messages and handlers
  initChains(router, chainsService);
  initKeyRing(router, keyRingService);
  initApprovals(router, approvalsService);

  router.listen(Ports.Background);

  const version = "0.1.0";
  const anoma = new Anoma(version, requester);

  return {
    anoma,
    iDBStore,
    extStore,
    activeAccountStore,
    chainsService,
    keyRingService,
  };
};
