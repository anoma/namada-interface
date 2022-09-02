import { InjectedAnoma } from "../provider";
import { init } from "./init";
import manifest from "../browsers/chrome/manifest.json";

const anoma = new InjectedAnoma(manifest.version);

export const inject = () => init(anoma);
