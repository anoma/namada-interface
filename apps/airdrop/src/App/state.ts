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
