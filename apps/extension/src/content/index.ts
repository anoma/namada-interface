import { Anoma } from "../api";
import { Anoma as IAnoma } from "@anoma/types";
import Manifest from "../manifest/chrome/manifest.json";

const { version } = Manifest;

declare global {
  var anoma: IAnoma;
}

/**
 * This content script gets loaded into the browser runtime
 */
// TODO: Call the following from within a script gets injected via
// a <script> tag:
window.anoma = new Anoma(version);
