import { init } from "./init";
import { Anoma } from "../api";

import manifest from "../browsers/chrome/manifest.json";

const anoma = new Anoma(manifest.version);

export const inject = () => init(anoma);
