import { IndexedDBKVStore } from "@anoma/storage";
import { init as initCrypto } from "@anoma/crypto";
import { init as initShared } from "@anoma/shared";

import { ExtensionRouter, ExtensionGuards } from "../extension";
import { ContentScriptEnv } from "../extension/utils";
import { Ports, KVPrefix } from "../router/types";
import { ChainsService } from "./chains";
import { KeyRingService } from "./keyring";
import { init as initChains } from "./chains/init";
import { init as initKeyRing } from "./keyring/init";
import { chains } from "../chains";

initCrypto();
initShared();

const store = new IndexedDBKVStore(KVPrefix.IndexedDB);
const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const chainsService = new ChainsService(store, chains);
chainsService.init();

const keyRingService = new KeyRingService(store);
keyRingService.init();

// Initialize messages and handlers
initChains(router, chainsService);
initKeyRing(router, keyRingService);

router.listen(Ports.Background);
