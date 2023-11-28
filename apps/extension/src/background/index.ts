import browser from "webextension-polyfill";
import {
  ExtensionKVStore,
  IndexedDBKVStore,
  MemoryKVStore,
  SessionKVStore,
} from "@namada/storage";
import { ProxyMappings } from "@namada/chains";
import { init as initCrypto } from "@namada/crypto/src/init";
import { init as initShared } from "@namada/shared/src/init";
import { Query, Sdk } from "@namada/shared";

import {
  ExtensionBroadcaster,
  ExtensionRouter,
  ExtensionGuards,
  ContentScriptEnv,
  ExtensionMessenger,
  ExtensionRequester,
  getNamadaRouterId,
} from "extension";
import { Ports, KVPrefix } from "router";
import { ApprovalsService, init as initApprovals } from "./approvals";
import {
  KeyRingService,
  init as initKeyRing,
  SDK_KEY,
  PARENT_ACCOUNT_ID_KEY,
  UtilityStore,
  ActiveAccountStore,
} from "./keyring";
import { LedgerService, init as initLedger } from "./ledger";
import { VaultService, init as initVault } from "./vault";

const store = new IndexedDBKVStore(KVPrefix.IndexedDB);
const sessionStore = new SessionKVStore(KVPrefix.SessionStorage);
const utilityStore = new IndexedDBKVStore<UtilityStore>(KVPrefix.Utility);
// TODO: For now we will be running two stores side by side
const sdkStore = new IndexedDBKVStore(KVPrefix.SDK);
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
const { REACT_APP_PROXY, REACT_APP_NAMADA_URL = DEFAULT_URL } = process.env;

const NamadaRpcEndpoint = REACT_APP_PROXY
  ? ProxyMappings["namada"]
  : REACT_APP_NAMADA_URL;

const messenger = new ExtensionMessenger();
const router = new ExtensionRouter(
  ContentScriptEnv.produceEnv,
  messenger,
  extensionStore
);

router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const init = new Promise<void>(async (resolve) => {
  const { memory: cryptoMemory } = await initCrypto();

  await initShared();
  const sdk = new Sdk(NamadaRpcEndpoint);
  const query = new Query(NamadaRpcEndpoint);

  const sdkData: Record<string, string> | undefined = await sdkStore.get(
    SDK_KEY
  );
  const activeAccount = await utilityStore.get<ActiveAccountStore>(
    PARENT_ACCOUNT_ID_KEY
  );

  if (sdkData && Object.keys(sdkData).length > 0 && activeAccount) {
    const data = new TextEncoder().encode(sdkData[activeAccount.id]);
    sdk.decode(data);
  }

  const routerId = await getNamadaRouterId(extensionStore);
  const requester = new ExtensionRequester(messenger, routerId);
  const broadcaster = new ExtensionBroadcaster(connectedTabsStore, requester);

  const vaultService = new VaultService(
    store,
    sessionStore,
    cryptoMemory,
    broadcaster
  );
  const keyRingService = new KeyRingService(
    vaultService,
    sdkStore,
    utilityStore,
    connectedTabsStore,
    extensionStore,
    sdk,
    query,
    cryptoMemory,
    requester,
    broadcaster
  );
  const ledgerService = new LedgerService(
    keyRingService,
    store,
    sdkStore,
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
  initKeyRing(router, keyRingService);
  initLedger(router, ledgerService);
  initVault(router, vaultService);

  resolve();
});

router.listen(Ports.Background, init);
