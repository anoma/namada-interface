import browser from "webextension-polyfill";
import { Anoma, Proxy } from "provider";
import {
  ExtensionRouter,
  ExtensionRequester,
  ContentScriptEnv,
  ContentScriptGuards,
} from "extension";
import { Ports } from "router/types";
import { initEvents } from "./events";
import manifest from "manifest/_base.json";

// Start proxying messages from Anoma to InjectedAnoma
Proxy.start(new Anoma(manifest.version, new ExtensionRequester()));

const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
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

// Establish port connection to background:
const port = browser.runtime.connect({ name: "session-port" });
port.postMessage({ msg: "Connecting to background" });

port.onMessage.addListener((m) => {
  console.info(`Port connection successful! ${m.msg}`);
});
