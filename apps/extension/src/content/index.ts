import browser from "webextension-polyfill";
import { Anoma, InjectedAnoma } from "../provider";
import { ExtensionRouter, ExtensionRequester } from "../extension";
import { Ports } from "../router/types";
import { initEvents } from "./events";
import { ContentScriptEnv } from "../utils";
import { ContentScriptGuards } from "../extension/guards";
import manifest from "../browsers/chrome/manifest.json";

// Start proxying messages from Anoma to InjectedAnoma
InjectedAnoma.startProxy(new Anoma(manifest.version, new ExtensionRequester()));

const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
initEvents(router);
router.listen(Ports.WebBrowser);
router.addGuard(ContentScriptGuards.checkMessageIsInternal);

// Insert a script element to load injection script
const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

scriptElement.src = browser.runtime.getURL("scripts/inject.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
