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

export type Signature = {
  signature: string;
  pubKey: { type: string; value: string };
};

export type KeplrClaimType = "cosmos" | "osmosis" | "stargaze";
export type ClaimType = "github" | KeplrClaimType;

export type GithubState2 = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  type: ClaimType;
  githubToken: string;
};

export type KeplrState = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  type: ClaimType;
  signature: Signature;
  address: string;
};

export type CommonState = GithubState2 | KeplrState;

export type GithubState = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  type: "github" | "cosmos" | "";
  githubToken?: string;
  signature?: Signature;
};

export const githubAtom = atom<CommonState | null>(null);

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
