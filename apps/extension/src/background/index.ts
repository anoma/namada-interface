import { init as initCrypto } from "@namada/crypto/src/init";
import { init as initShared } from "@namada/shared/src/init";
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
import { LocalStorage, RevealedPKStorage, VaultStorage } from "storage";
import { ApprovalsService, init as initApprovals } from "./approvals";
import { ChainsService, init as initChains } from "./chains";
import { KeyRingService, UtilityStore, init as initKeyRing } from "./keyring";
import { LedgerService, init as initLedger } from "./ledger";
import { SdkService } from "./sdk/service";
import { VaultService, init as initVault } from "./vault";

// Extension storages
const localStorage = new LocalStorage(
  new ExtensionKVStore(KVPrefix.LocalStorage, browser.storage.local)
);
const revealedPKStorage = new RevealedPKStorage(
  new ExtensionKVStore(KVPrefix.RevealedPK, browser.storage.local)
);

//IDB storages
const vaultStorage = new VaultStorage(new IndexedDBKVStore(KVPrefix.IndexedDB));
const utilityStore = new IndexedDBKVStore<UtilityStore>(KVPrefix.Utility);

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
  const cryptoWasm = await fetch("crypto.namada.wasm").then((wasm) =>
    wasm.arrayBuffer()
  );
  const { memory: cryptoMemory } = await initCrypto(cryptoWasm);

  const sharedWasm = await fetch("shared.namada.wasm").then((wasm) =>
    wasm.arrayBuffer()
  );
  await initShared(sharedWasm);

  const routerId = await getNamadaRouterId(localStorage);
  const requester = new ExtensionRequester(messenger, routerId);
  const broadcaster = new ExtensionBroadcaster(localStorage, requester);

  const vaultService = new VaultService(
    vaultStorage,
    sessionStore,
    cryptoMemory,
    broadcaster
  );
  await vaultService.initialize();
  const chainsService = new ChainsService(localStorage, broadcaster);
  const sdkService = new SdkService(chainsService);
  const keyRingService = new KeyRingService(
    vaultService,
    sdkService,
    chainsService,
    utilityStore,
    localStorage,
    vaultStorage,
    cryptoMemory,
    requester,
    broadcaster
  );
  const ledgerService = new LedgerService(
    keyRingService,
    sdkService,
    vaultStorage,
    txStore,
    revealedPKStorage,
    requester,
    broadcaster
  );
  const approvalsService = new ApprovalsService(
    txStore,
    dataStore,
    localStorage,
    keyRingService,
    ledgerService,
    vaultService,
    broadcaster
  );

  // Initialize messages and handlers
  initApprovals(router, approvalsService);
  initChains(router, chainsService);
  initKeyRing(router, keyRingService);
  initLedger(router, ledgerService);
  initVault(router, vaultService);
  resolve();
});

router.listen(Ports.Background, init);
