import { Anoma } from "@anoma/types";

declare global {
  var anoma: Anoma;
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
