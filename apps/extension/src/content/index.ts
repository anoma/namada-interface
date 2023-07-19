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

// Start proxying messages from Namada to InjectedNamada
(async function init() {
  const extensionStore = new ExtensionKVStore(KVPrefix.LocalStorage, {
    get: browser.storage.local.get,
    set: browser.storage.local.set,
  });
  const routerId = await getNamadaRouterId(extensionStore);
  const messenger = new ExtensionMessenger();
  Proxy.start(
    new Namada(manifest.version, new ExtensionRequester(messenger, routerId))
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

  scriptElement.src = browser.runtime.getURL("injected.namada.js");
  scriptElement.type = "text/javascript";
  container.insertBefore(scriptElement, container.children[0]);
  scriptElement.remove();
})();
