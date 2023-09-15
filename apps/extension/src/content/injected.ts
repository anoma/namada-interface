// import needs to be "provider/InjectedNamada" since "provider" will make
// webpack bundle webextension-polyfill, which causes a runtime crash
import { InjectedNamada } from "provider/InjectedNamada";

import manifest from "manifest/_base.json";

declare global {
  // NOTE: var is required to extend globalThis
  // eslint-disable-next-line
  var namada: InjectedNamada;
}

export function init(namada: InjectedNamada): void {
  if (process.env.NODE_ENV !== "production") {
    if (!window.namada) {
      window.namada = namada;
    }
  } else {
    window.namada = namada;
  }
}

init(new InjectedNamada(manifest.version));
