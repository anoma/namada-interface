import { KVStore } from "@namada/storage";

import {
  ExtensionBroadcaster,
  ExtensionMessengerMock,
  ExtensionRequester,
  ExtensionRouter,
  getNamadaRouterId,
} from "extension";
import { KVPrefix, Ports } from "router";
import {
  KeyRingService,
  UtilityStore,
  init as initKeyRing,
} from "../background/keyring";

import { SessionValues, VaultService } from "background/vault";

import {
  ApprovalsService,
  PendingTx,
  init as initApprovals,
} from "../background/approvals";

import { ChainService } from "background/chain";
import { SdkService } from "background/sdk";
import { Namada } from "provider";
import { LocalStorage, VaultStorage } from "storage";

export class KVStoreMock<T> implements KVStore<T> {
  private storage: { [key: string]: T | null } = {};

  constructor(readonly _prefix: string) {}

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
  vaultStorage: VaultStorage;
  extStore: KVStoreMock<number>;
  utilityStore: KVStoreMock<UtilityStore>;
  keyRingService: KeyRingService;
  vaultService: VaultService;
}> => {
  const messenger = new ExtensionMessengerMock();
  const sessionStore = new KVStoreMock<SessionValues>(KVPrefix.SessionStorage);
  const extStore = new KVStoreMock<number>(KVPrefix.IndexedDB);
  const utilityStore = new KVStoreMock<UtilityStore>(KVPrefix.Utility);
  const localStorage = new LocalStorage(new KVStoreMock(KVPrefix.LocalStorage));
  const vaultStorage = new VaultStorage(new KVStoreMock(KVPrefix.IndexedDB));
  const namadaRouterId = await getNamadaRouterId(localStorage);
  const requester = new ExtensionRequester(messenger, namadaRouterId);
  const txStore = new KVStoreMock<PendingTx>(KVPrefix.LocalStorage);
  const dataStore = new KVStoreMock<string>(KVPrefix.LocalStorage);
  const broadcaster = new ExtensionBroadcaster(localStorage, requester);

  const router = new ExtensionRouter(
    () => ({
      isInternalMsg: true,
      senderTabId: -2,
      requestInteraction: () => {
        throw new Error("Test env doesn't support `requestInteraction`");
      },
    }),
    messenger,
    localStorage
  );

  const sdkService = await SdkService.init();

  const vaultService = new VaultService(vaultStorage, sessionStore, sdkService);
  await vaultService.initialize();

  const chainsService = new ChainService(sdkService, localStorage, broadcaster);

  const keyRingService = new KeyRingService(
    vaultService,
    sdkService,
    chainsService,
    utilityStore,
    localStorage,
    vaultStorage,
    requester,
    broadcaster
  );

  const approvalsService = new ApprovalsService(
    txStore,
    dataStore,
    localStorage,
    sdkService,
    keyRingService,
    vaultService,
    chainsService,
    broadcaster
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
    vaultStorage,
    extStore,
    utilityStore,
    keyRingService,
    vaultService,
  };
};
