import { InjectedAnoma } from "provider";
import manifest from "manifest/_base.json";

declare global {
  // NOTE: var is required to extend globalThis
  // eslint-disable-next-line
  var anoma: InjectedAnoma;
}

export function init(anoma: InjectedAnoma): void {
  if (process.env.NODE_ENV !== "production") {
    if (!window.anoma) {
      window.anoma = anoma;
    }
  } else {
    window.anoma = anoma;
  }
}

init(new InjectedAnoma(manifest.version));
