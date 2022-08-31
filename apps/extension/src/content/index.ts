import { Anoma } from "../api/Anoma";

declare global {
  var Anoma: Anoma;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    Anoma: Anoma;
  };

window.Anoma = new Anoma();
console.info("Anoma Extension loaded!");
