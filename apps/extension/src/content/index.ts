import { Anoma as AnomaAPI } from "../api/Anoma";

declare global {
  var Anoma: AnomaAPI;
}

export type WindowWithAnoma = Window &
  typeof globalThis & {
    Anoma: AnomaAPI;
  };

window.Anoma = new AnomaAPI();
console.info("Anoma Extension loaded!");
