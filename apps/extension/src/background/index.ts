import { ProxyMappings } from "@namada/chains";
import { init as initCrypto } from "@namada/crypto/src/init";
import { Sdk } from "@namada/shared";
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
import { ApprovalsService, init as initApprovals } from "./approvals";
import { ChainsService, init as initChains } from "./chains";
import { KeyRingService, UtilityStore, init as initKeyRing } from "./keyring";
import { LedgerService, init as initLedger } from "./ledger";
import { VaultService, init as initVault } from "./vault";

const store = new IndexedDBKVStore(KVPrefix.IndexedDB);
const sessionStore = new SessionKVStore(KVPrefix.SessionStorage);
const utilityStore = new IndexedDBKVStore<UtilityStore>(KVPrefix.Utility);
// TODO: For now we will be running two stores side by side
const extensionStore = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const connectedTabsStore = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const approvedOriginsStore = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const revealedPKStore = new ExtensionKVStore(KVPrefix.RevealedPK, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const txStore = new MemoryKVStore(KVPrefix.Memory);

const DEFAULT_URL =
  "https://d3brk13lbhxfdb.cloudfront.net/qc-testnet-5.1.025a61165acd05e";
const { NAMADA_INTERFACE_PROXY, NAMADA_INTERFACE_NAMADA_URL = DEFAULT_URL } =
  process.env;

const NamadaRpcEndpoint = NAMADA_INTERFACE_PROXY
  ? ProxyMappings["namada"]
  : NAMADA_INTERFACE_NAMADA_URL;

const messenger = new ExtensionMessenger();
const router = new ExtensionRouter(
  ContentScriptEnv.produceEnv,
  messenger,
  extensionStore
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
  const sdk = new Sdk(NamadaRpcEndpoint);

  const routerId = await getNamadaRouterId(extensionStore);
  const requester = new ExtensionRequester(messenger, routerId);
  const broadcaster = new ExtensionBroadcaster(connectedTabsStore, requester);

  const vaultService = new VaultService(
    store,
    sessionStore,
    cryptoMemory,
    broadcaster
  );
  const chainsService = new ChainsService(store);
  const keyRingService = new KeyRingService(
    vaultService,
    utilityStore,
    connectedTabsStore,
    extensionStore,
    cryptoMemory,
    requester,
    broadcaster
  );
  const ledgerService = new LedgerService(
    keyRingService,
    store,
    connectedTabsStore,
    txStore,
    revealedPKStore,
    sdk,
    requester,
    broadcaster
  );
  const approvalsService = new ApprovalsService(
    txStore,
    connectedTabsStore,
    approvedOriginsStore,
    keyRingService,
    ledgerService,
    vaultService
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
