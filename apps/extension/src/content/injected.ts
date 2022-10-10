import { InjectedAnoma } from "provider";
import manifest from "manifest/_base.json";

declare global {
  var anoma: InjectedAnoma;
}

export function init(anoma: InjectedAnoma) {
  if (process.env.NODE_ENV !== "production") {
    if (!window.anoma) {
      window.anoma = anoma;
    }
  } else {
    window.anoma = anoma;
  }
}

init(new InjectedAnoma(manifest.version));
