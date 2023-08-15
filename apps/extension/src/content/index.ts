import browser from "webextension-polyfill";
import { Namada, Proxy } from "provider";
import {
  ExtensionRouter,
  ExtensionRequester,
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionMessenger,
  getNamadaRouterId,
} from "extension";
import { KVPrefix, Ports } from "router/types";
import { initEvents } from "./events";
import manifest from "manifest/_base.json";
import { ExtensionKVStore } from "@namada/storage";

const extensionStore = new ExtensionKVStore(KVPrefix.LocalStorage, {
  get: browser.storage.local.get,
  set: browser.storage.local.set,
});
const messenger = new ExtensionMessenger();

const router = new ExtensionRouter(
  ContentScriptEnv.produceEnv,
  messenger,
  extensionStore
);

const init = new Promise<void>(async (resolve) => {
  // Start proxying messages from Namada to InjectedNamada
  const routerId = await getNamadaRouterId(extensionStore);
  Proxy.start(
    new Namada(manifest.version, new ExtensionRequester(messenger, routerId))
  );
  resolve();
});

router.listen(Ports.WebBrowser, init);
router.addGuard(ContentScriptGuards.checkMessageIsInternal);

initEvents(router);

// Insert a script element to load injection script
const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

scriptElement.src = browser.runtime.getURL("injected.namada.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
