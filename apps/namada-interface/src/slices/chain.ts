import { chains } from "@namada/chains";
import { Chain } from "@namada/types";
import { atom } from "jotai";

export const chainAtom = atom<Chain>((_get) => chains.namada);
