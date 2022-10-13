import { IndexedDBKVStore } from "@anoma/storage";
import { init as initCrypto } from "@anoma/crypto";
import { init as initShared } from "@anoma/shared";

import { ExtensionRouter, ExtensionGuards, ContentScriptEnv } from "extension";
import { Ports, KVPrefix } from "router";
import { chains } from "config";
import { ChainsService, init as initChains } from "./chains";
import { KeyRingService, init as initKeyRing } from "./keyring";

initCrypto();
initShared();

const store = new IndexedDBKVStore(KVPrefix.IndexedDB);
const router = new ExtensionRouter(ContentScriptEnv.produceEnv, () => {
  // eslint-disable-next-line
});
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const chainsService = new ChainsService(store, chains);
const keyRingService = new KeyRingService(store);

// Initialize messages and handlers
initChains(router, chainsService);
initKeyRing(router, keyRingService);

router.listen(Ports.Background);
