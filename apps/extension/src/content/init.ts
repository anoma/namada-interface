import { Anoma } from "@anoma/types";

declare global {
  var anoma: Anoma;
  var suggestChain: Anoma["suggestChain"];
  var connect: Anoma["connect"];
  var getSigner: Anoma["getSigner"];
  var chains: Anoma["chains"];
}

export function init(anoma: Anoma) {
  if (process.env.NODE_ENV !== "production") {
    if (!window.anoma) {
      window.anoma = anoma;
    }
    if (!window.suggestChain) {
      window.suggestChain = anoma.suggestChain;
    }
    if (!window.connect) {
      window.connect = anoma.connect;
    }
    if (!window.getSigner) {
      window.getSigner = anoma.getSigner;
    }
    if (!window.chains) {
      window.chains = anoma.chains;
    }
  } else {
    window.anoma = anoma;
    window.suggestChain = anoma.suggestChain;
    window.connect = anoma.connect;
    window.chains = anoma.chains;
  }
}
