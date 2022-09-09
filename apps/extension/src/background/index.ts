import { IndexedDBKVStore } from "@anoma/storage";
import { init } from "@anoma/crypto";
import { ExtensionRouter, ExtensionGuards } from "../extension";
import { ContentScriptEnv } from "../utils";
import { Ports } from "../router/types";

import { ChainsService } from "./chains";
import { init as initChains } from "./chains/init";
import { chains } from "../chains";

const store = new IndexedDBKVStore("anoma");

const initWasm = async () => {
  await init();
  console.debug("wasm loaded");
};

initWasm();

const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
router.addGuard(ExtensionGuards.checkOriginIsValid);
router.addGuard(ExtensionGuards.checkMessageIsInternal);

const chainsService = new ChainsService(store, chains);
chainsService.init();

// Initialize messages and handlers
initChains(router, chainsService);

router.listen(Ports.Background);
