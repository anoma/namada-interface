import browser from "webextension-polyfill";
import { Anoma, Proxy } from "provider";
import {
  ExtensionRouter,
  ExtensionRequester,
  ContentScriptEnv,
  ContentScriptGuards,
  ExtensionMessenger,
  getAnomaRouterId,
} from "extension";
import { KVPrefix, Ports } from "router/types";
import { initEvents } from "./events";
import manifest from "manifest/_base.json";
import { ExtensionKVStore } from "@anoma/storage";

// Start proxying messages from Anoma to InjectedAnoma
(async function init() {
  const extensionStore = new ExtensionKVStore(KVPrefix.LocalStorage, {
    get: browser.storage.local.get,
    set: browser.storage.local.set,
  });
  const routerId = await getAnomaRouterId(extensionStore);
  const messenger = new ExtensionMessenger();
  Proxy.start(
    new Anoma(manifest.version, new ExtensionRequester(messenger, routerId))
  );

  const router = new ExtensionRouter(
    ContentScriptEnv.produceEnv,
    messenger,
    extensionStore
  );
  initEvents(router);
  router.listen(Ports.WebBrowser);
  router.addGuard(ContentScriptGuards.checkMessageIsInternal);

  // Insert a script element to load injection script
  const container = document.head || document.documentElement;
  const scriptElement = document.createElement("script");

  scriptElement.src = browser.runtime.getURL("injected.anoma.js");
  scriptElement.type = "text/javascript";
  container.insertBefore(scriptElement, container.children[0]);
  scriptElement.remove();
})();
