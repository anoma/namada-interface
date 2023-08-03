import browser from "webextension-polyfill";
import {
  ExtensionKVStore,
  IndexedDBKVStore,
  MemoryKVStore,
} from "@namada/storage";
import { defaultChainId, chains } from "@namada/chains";
import { init as initCrypto } from "@namada/crypto/src/init";
import { init as initShared } from "@namada/shared/src/init";
import { Query, Sdk } from "@namada/shared";

import {
  ExtensionRouter,
  ExtensionGuards,
  ContentScriptEnv,
  ExtensionMessenger,
  ExtensionRequester,
  getNamadaRouterId,
} from "extension";
import { Ports, KVPrefix } from "router";
import { ApprovalsService, init as initApprovals } from "./approvals";
import { ChainsService, init as initChains } from "./chains";
import {
  KeyRingService,
  init as initKeyRing,
  SDK_KEY,
  PARENT_ACCOUNT_ID_KEY,
  UtilityStore,
  ActiveAccountStore,
} from "./keyring";
import { LedgerService, init as initLedger } from "./ledger";

const store = new IndexedDBKVStore(KVPrefix.IndexedDB);

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

const txStore = new MemoryKVStore(KVPrefix.Memory);

const DEFAULT_URL =
  "https://d3brk13lbhxfdb.cloudfront.net/qc-testnet-5.1.025a61165acd05e";
const { REACT_APP_NAMADA_URL = DEFAULT_URL } = process.env;

(async function init() {
  const { memory: cryptoMemory } = await initCrypto();

  await initShared();

  const routerId = await getNamadaRouterId(extensionStore);
  const messenger = new ExtensionMessenger();
  const requester = new ExtensionRequester(messenger, routerId);

  const router = new ExtensionRouter(
    ContentScriptEnv.produceEnv,
    messenger,
    extensionStore
  );
  router.addGuard(ExtensionGuards.checkOriginIsValid);
  router.addGuard(ExtensionGuards.checkMessageIsInternal);

  //TODO: Most likely sdk and query should be a one thing
  const sdk = new Sdk(REACT_APP_NAMADA_URL);
  const query = new Query(REACT_APP_NAMADA_URL);

  const sdkData: Record<string, string> | undefined = await sdkStore.get(
    SDK_KEY
  );
  const activeAccount = await utilityStore.get<ActiveAccountStore>(
    PARENT_ACCOUNT_ID_KEY
  );

  if (sdkData && activeAccount) {
    const data = new TextEncoder().encode(sdkData[activeAccount.id]);
    sdk.decode(data);
  }

  const chainsService = new ChainsService(store, [chains[defaultChainId]]);
  const keyRingService = new KeyRingService(
    store,
    sdkStore,
    utilityStore,
    connectedTabsStore,
    extensionStore,
    defaultChainId,
    sdk,
    query,
    cryptoMemory,
    requester
  );
  const ledgerService = new LedgerService(
    keyRingService,
    store,
    sdkStore,
    connectedTabsStore,
    txStore,
    defaultChainId,
    sdk,
    requester
  );
  const approvalsService = new ApprovalsService(
    txStore,
    connectedTabsStore,
    keyRingService,
    ledgerService
  );

  // Initialize messages and handlers
  initApprovals(router, approvalsService);
  initChains(router, chainsService);
  initKeyRing(router, keyRingService);
  initLedger(router, ledgerService);

  router.listen(Ports.Background);
})();
