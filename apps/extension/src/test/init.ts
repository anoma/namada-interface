import { KVStore } from "@namada/storage";
import { Chain } from "@namada/types";

import {
  ExtensionBroadcaster,
  ExtensionMessengerMock,
  ExtensionRequester,
  ExtensionRouter,
  getNamadaRouterId,
} from "extension";
import { KVPrefix, Ports } from "router";
import {
  AccountStore,
  KeyRingService,
  TabStore,
  UtilityStore,
  init as initKeyRing,
} from "../background/keyring";

import {
  KeyStore,
  SessionPassword,
  VaultService,
  VaultStore,
} from "background/vault";

import {
  ApprovalsService,
  ApprovedOriginsStore,
  TxStore,
  init as initApprovals,
} from "../background/approvals";

import { ChainsService } from "background/chains";
import { LedgerService } from "background/ledger";
import { SdkService } from "background/sdk";
import { Namada } from "provider";

// __wasm is not exported in crypto.d.ts so need to use require instead of import
/* eslint-disable @typescript-eslint/no-var-requires */
const cryptoMemory = require("@namada/crypto").__wasm.memory;

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

export type DBType = Chain[] | KeyStore[] | VaultStore;

export const init = async (): Promise<{
  namada: Namada;
  iDBStore: KVStoreMock<DBType>;
  extStore: KVStoreMock<number>;
  utilityStore: KVStoreMock<UtilityStore>;
  keyRingService: KeyRingService;
  vaultService: VaultService;
}> => {
  const messenger = new ExtensionMessengerMock();
  const iDBStore = new KVStoreMock<DBType>(KVPrefix.IndexedDB);
  const sessionStore = new KVStoreMock<SessionPassword>(
    KVPrefix.SessionStorage
  );
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
  const dataStore = new KVStoreMock<string>(KVPrefix.LocalStorage);
  const chainStore = new KVStoreMock<Chain>(KVPrefix.LocalStorage);
  const broadcaster = new ExtensionBroadcaster(connectedTabsStore, requester);

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

  const vaultService = new VaultService(
    iDBStore as KVStore<KeyStore[]>,
    sessionStore,
    cryptoMemory
  );
  const chainsService = new ChainsService(chainStore, broadcaster);
  const sdkService = new SdkService(chainsService);

  const keyRingService = new KeyRingService(
    vaultService,
    sdkService,
    chainsService,
    utilityStore,
    connectedTabsStore,
    extStore,
    cryptoMemory,
    requester,
    broadcaster
  );

  const ledgerService = new LedgerService(
    keyRingService,
    sdkService,
    iDBStore as KVStore<AccountStore[]>,
    connectedTabsStore,
    txStore,
    revealedPKStore,
    requester,
    broadcaster
  );

  const approvalsService = new ApprovalsService(
    txStore,
    dataStore,
    connectedTabsStore,
    approvedOriginsStore,
    keyRingService,
    ledgerService,
    vaultService
  );

  const init = new Promise<void>(async (resolve) => {
    // Initialize messages and handlers
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
    keyRingService,
    vaultService,
  };
};
