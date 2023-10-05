import { chains } from "@namada/chains";
import { Query, Sdk } from "@namada/shared";
import { KVStore } from "@namada/storage";
import { Chain } from "@namada/types";

import {
  ExtensionBroadcaster,
  ExtensionRouter,
  ExtensionMessengerMock,
  ExtensionRequester,
  getNamadaRouterId,
} from "extension";
import { Ports, KVPrefix } from "router";
import { ChainsService, init as initChains } from "background/chains";
import {
  KeyRingService,
  init as initKeyRing,
  KeyStore,
  TabStore,
  UtilityStore,
  AccountStore,
} from "../background/keyring";

import {
  ApprovalsService,
  init as initApprovals,
  ApprovedOriginsStore,
  TxStore,
} from "../background/approvals";

import { Namada } from "provider";
import { LedgerService } from "background/ledger";

// __wasm is not exported in crypto.d.ts so need to use require instead of import
/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;
const chainId = "namada-75a7e12.69483d59a9fb174";

export class KVStoreMock<T> implements KVStore<T> {
  private storage: { [key: string]: T | null } = {};

  constructor(readonly _prefix: string) { }

  get<U extends T>(key: string): Promise<U | undefined> {
    return new Promise((resolve) => {
      const data = this.storage[key];
      return resolve(data ? (data as U) : undefined);
    });
  }
  set<U extends T>(key: string, data: U | null): Promise<void> {
    this.storage[key] = data;
    return Promise.resolve();
  }
  prefix(): string {
    return this._prefix;
  }
}

export const init = async (): Promise<{
  namada: Namada;
  iDBStore: KVStoreMock<Chain[] | KeyStore[]>;
  extStore: KVStoreMock<number>;
  utilityStore: KVStoreMock<UtilityStore>;
  chainsService: ChainsService;
  keyRingService: KeyRingService;
}> => {
  const messenger = new ExtensionMessengerMock();
  const iDBStore = new KVStoreMock<Chain[] | KeyStore[]>(KVPrefix.IndexedDB);
  const sdkStore = new KVStoreMock<Record<string, string>>(KVPrefix.SDK);
  const extStore = new KVStoreMock<number>(KVPrefix.IndexedDB);
  const utilityStore = new KVStoreMock<UtilityStore>(KVPrefix.Utility);
  const connectedTabsStore = new KVStoreMock<TabStore[]>(
    KVPrefix.ConnectedTabs
  );
  const approvedOriginsStore = new KVStoreMock<ApprovedOriginsStore>(
    KVPrefix.LocalStorage
  );
  const revealedPKStore = new KVStoreMock<string[]>(KVPrefix.RevealedPK);
  const namadaRouterId = await getNamadaRouterId(extStore);
  const requester = new ExtensionRequester(messenger, namadaRouterId);
  const txStore = new KVStoreMock<TxStore>(KVPrefix.LocalStorage);
  const broadcaster = new ExtensionBroadcaster(
    connectedTabsStore,
    chainId,
    requester
  );

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
    utilityStore,
    connectedTabsStore,
    extStore,
    chainId,
    sdk,
    query,
    cryptoMemory,
    requester,
    broadcaster
  );

  const ledgerService = new LedgerService(
    keyRingService,
    iDBStore as KVStore<AccountStore[]>,
    sdkStore,
    connectedTabsStore,
    txStore,
    revealedPKStore,
    chainId,
    sdk,
    requester,
    broadcaster
  );

  const approvalsService = new ApprovalsService(
    txStore,
    connectedTabsStore,
    approvedOriginsStore,
    keyRingService,
    ledgerService
  );

  const init = new Promise<void>(async (resolve) => {
    // Initialize messages and handlers
    initChains(router, chainsService);
    initKeyRing(router, keyRingService);
    initApprovals(router, approvalsService);
    resolve();
  });

  router.listen(Ports.Background, init);

  const version = "0.1.0";
  const namada = new Namada(version, requester);

  return {
    namada,
    iDBStore,
    extStore,
    utilityStore,
    chainsService,
    keyRingService,
  };
};
