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
  } else {
    window.anoma = anoma;
  }
}
