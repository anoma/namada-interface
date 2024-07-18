import {
  ExtensionKVStore,
  IndexedDBKVStore,
  MemoryKVStore,
  SessionKVStore,
} from "@namada/storage";
import browser from "webextension-polyfill";

import {
  ContentScriptEnv,
  ExtensionBroadcaster,
  ExtensionGuards,
  ExtensionMessenger,
  ExtensionRequester,
  ExtensionRouter,
  getNamadaRouterId,
} from "extension";
import { KVPrefix, Ports } from "router";
import { LocalStorage, VaultStorage } from "storage";
import {
  ApprovalsService,
  WasmHashesStore,
  init as initApprovals,
} from "./approvals";
import { ChainsService, init as initChains } from "./chains";
import { KeyRingService, UtilityStore, init as initKeyRing } from "./keyring";
import { SdkService } from "./sdk/service";
import { VaultService, init as initVault } from "./vault";

// Extension storages
const localStorage = new LocalStorage(
  new ExtensionKVStore(KVPrefix.LocalStorage, browser.storage.local)
);

//IDB storages
const vaultStorage = new VaultStorage(new IndexedDBKVStore(KVPrefix.IndexedDB));
const utilityStore = new IndexedDBKVStore<UtilityStore>(KVPrefix.Utility);
const wasmHashesStore = new IndexedDBKVStore<WasmHashesStore>(
  KVPrefix.WasmHashesStorage
);

// Memory/transient storages
const sessionStore = new SessionKVStore(KVPrefix.SessionStorage);
const txStore = new MemoryKVStore(KVPrefix.Memory);
const dataStore = new MemoryKVStore(KVPrefix.Memory);

const messenger = new ExtensionMessenger();
const router = new ExtensionRouter(
  ContentScriptEnv.produceEnv,
  messenger,
  localStorage
);

router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const init = new Promise<void>(async (resolve) => {
  const routerId = await getNamadaRouterId(localStorage);
  const requester = new ExtensionRequester(messenger, routerId);
  const broadcaster = new ExtensionBroadcaster(localStorage, requester);
  const sdkService = await SdkService.init(localStorage);

  const vaultService = new VaultService(
    vaultStorage,
    sessionStore,
    sdkService,
    broadcaster
  );
  await vaultService.initialize();
  const chainsService = new ChainsService(
    sdkService,
    localStorage,
    wasmHashesStore,
    broadcaster
  );
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
    wasmHashesStore,
    sdkService,
    keyRingService,
    vaultService,
    chainsService,
    broadcaster
  );

  // Initialize messages and handlers
  initApprovals(router, approvalsService);
  initChains(router, chainsService);
  initKeyRing(router, keyRingService);
  initVault(router, vaultService);
  resolve();
});

router.listen(Ports.Background, init);
