import { InjectedAnoma } from "../provider";
import { init } from "./init";
import manifest from "../browsers/chrome/manifest.json";

const anoma = new InjectedAnoma(manifest.version || "0.1.0");

export const inject = () => init(anoma);
