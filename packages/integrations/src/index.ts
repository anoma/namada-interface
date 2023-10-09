import { namada, cosmos, ethereum } from "@namada/chains";
import Namada from "./Namada";
import Keplr from "./Keplr";
import Metamask from "./Metamask";

export { Namada, Keplr, Metamask };

export const extensions = {
  namada: new Namada(namada),
  keplr: new Keplr(cosmos),
  metamask: new Metamask(ethereum),
};
