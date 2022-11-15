import { IndexedDBKVStore } from "@anoma/storage";
import { init as initCrypto } from "@anoma/crypto";
import { init as initShared } from "@anoma/shared";

import { ExtensionRouter, ExtensionGuards, ContentScriptEnv } from "extension";
import { Ports, KVPrefix } from "router";
import { chains } from "config";
import { ChainsService, init as initChains } from "./chains";
import { KeyRingService, init as initKeyRing } from "./keyring";
import { PermissionsService, init as initPermissions } from "./permissions";

initCrypto();
initShared();

const store = new IndexedDBKVStore(KVPrefix.IndexedDB);
const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const chainsService = new ChainsService(store, chains);
const keyRingService = new KeyRingService(store);
const permissionsService = new PermissionsService(store, []);

permissionsService.init(chainsService, keyRingService);

// Initialize messages and handlers
initChains(router, chainsService);
initKeyRing(router, keyRingService);
initPermissions(router, permissionsService);

router.listen(Ports.Background);
