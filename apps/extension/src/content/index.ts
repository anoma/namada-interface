import { Anoma } from "../api";
import { InjectedAnoma } from "../provider";
import { ExtensionMessageRequester } from "../router";
import manifest from "../browsers/chrome/manifest.json";

InjectedAnoma.startProxy(
  new Anoma(manifest.version, new ExtensionMessageRequester())
);

// const router = new ExtensionRouter();
// initEvents(router);
// router.listen(WEBPAGE_PORT);

const container = document.head || document.documentElement;
const scriptElement = document.createElement("script");
scriptElement.src = (chrome || browser).runtime.getURL("scripts/inject.js");
scriptElement.type = "text/javascript";
container.insertBefore(scriptElement, container.children[0]);
scriptElement.remove();
