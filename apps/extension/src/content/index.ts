import browser from "webextension-polyfill";
import { Anoma } from "../api";
import { InjectedAnoma } from "../provider";
import { ExtensionRouter, ExtensionMessageRequester } from "../router";
import { Env, MessageSender, Ports } from "../types";
import { initEvents } from "./events";
import manifest from "../browsers/chrome/manifest.json";

// Start proxying messages from Anoma to InjectedAnoma
InjectedAnoma.startProxy(
  new Anoma(manifest.version, new ExtensionMessageRequester())
);

// Determine if content-scripts can be executed in this environment
// TODO: Refactor this out!
export class ContentScriptEnv {
  static readonly produceEnv = (sender: MessageSender): Env => {
    const isInternalMsg = sender.id === browser.runtime.id;

    return {
      isInternalMsg,
      requestInteraction: () => {
        throw new Error(
          "ContentScriptEnv doesn't support `requestInteraction`"
        );
      },
    };
  };
}

const router = new ExtensionRouter(ContentScriptEnv.produceEnv);
initEvents(router);
router.listen(Ports.WebBrowser);

// Insert a script element to load injection script
const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");

scriptElement.src = browser.runtime.getURL("scripts/inject.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
