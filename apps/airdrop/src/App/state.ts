import { atom } from "jotai";

export type KeplrSignature = {
  signature: string;
  pubKey: { type: string; value: string };
};

export const KEPLR_CLAIMS = ["cosmos", "osmosis", "badkids"] as const;
export type KeplrClaimType = (typeof KEPLR_CLAIMS)[number];
export type ClaimType = "github" | "ts" | "gitcoin" | KeplrClaimType;

export type GithubState = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  type: "github";
  githubToken?: string;
  githubUsername: string;
  eligibilities: string[];
};

export type KeplrState = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  type: KeplrClaimType;
  signature?: KeplrSignature;
  address: string;
  nonce: string;
};

export type TSState = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  type: "ts";
  nonce: string;
  publicKey: string;
};

export type GitcoinState = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  signature?: string;
  address: string;
  nonce: string;
  type: "gitcoin";
};

export type CommonState = GithubState | KeplrState | TSState | GitcoinState;
export const claimAtom = atom<CommonState | null>(null);

export type Label = {
  type: "unknown" | "username" | "publicKey" | "address";
  value: string;
};
export const labelAtom = atom<Label | undefined>((get) => {
  const claim = get(claimAtom);
  if (!claim) {
    return { type: "unknown", value: "" };
  }
  const { type } = claim;

  if (type === "github") {
    return { type: "username", value: claim.githubUsername };
  } else if (type === "ts") {
    return { type: "publicKey", value: claim.publicKey };
  } else if (type === "gitcoin" || KEPLR_CLAIMS.includes(type)) {
    return { type: "address", value: claim.address };
  }
});

export type ConfirmationState = {
  confirmed: boolean;
  address: string;
  publicKey: string;
  amount: number;
};
export const confirmationAtom = atom<ConfirmationState | null>(null);
