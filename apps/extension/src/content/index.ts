import browser from "webextension-polyfill";
import { Anoma } from "../api";
import { InjectedAnoma } from "../provider";
import { ExtensionRouter, ExtensionMessageRequester } from "../router";
import { Env, MessageSender } from "../types";
import { initEvents } from "./events";
import manifest from "../browsers/chrome/manifest.json";

export enum Ports {
  WebBrowser = "web-browser-port",
  Content = "content-port",
  Background = "background-port",
}

InjectedAnoma.startProxy(
  new Anoma(manifest.version, new ExtensionMessageRequester())
);

// TODO: Refactor this out!
// ContentScriptEnv only checks the id is same as the extension id.
// And, doesn't support the request interaction.
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

const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");
scriptElement.src = browser.runtime.getURL("scripts/inject.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
