import { Anoma } from "../api";

declare global {
  var Anoma: Anoma;
}

window.Anoma = new Anoma();
