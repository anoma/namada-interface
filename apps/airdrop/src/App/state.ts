import { atom } from "jotai";
import { Reducer } from "react";

export const DEFAULT_STATE: State = {
  namadaAddress: localStorage.getItem("namada_address") || "",
};

export type State = {
  namadaAddress: string;
};

export type Action = { type: "set_namada_address"; payload: string };

export const reducer: Reducer<State, Action> = (
  _state: State,
  action: Action
): State => {
  if (action.type === "set_namada_address") {
    return {
      namadaAddress: action.payload,
    };
  }
  throw Error("Unknown action.");
};

export type GithubState = {
  eligible: boolean;
  amount: number;
  githubToken?: string;
  hasClaimed: boolean;
};

export const githubAtom = atom<GithubState>({
  eligible: false,
  amount: 0,
  hasClaimed: false,
});

export type ConfirmationState = {
  confirmed: boolean;
  address: string;
  amount: number;
};

export const confirmationAtom = atom<ConfirmationState>({
  confirmed: false,
  address: "",
  amount: 0,
});
