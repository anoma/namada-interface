import browser from "webextension-polyfill";
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
const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const chainsService = new ChainsService(store, chains);
const keyRingService = new KeyRingService(store);

// Initialize messages and handlers
initChains(router, chainsService);
initKeyRing(router, keyRingService);

router.listen(Ports.Background);

type Msg = {
  msg: string;
};

// eslint-disable-next-line
let portFromCS: any;

// eslint-disable-next-line
const connected = (p: any): void => {
  portFromCS = p;
  portFromCS.postMessage({ msg: "Connection to background established." });
  portFromCS.onMessage.addListener((m: Msg) => {
    console.info(`Background received request to connect: ${m.msg}`);
  });
};

browser.runtime.onConnect.addListener(connected);
