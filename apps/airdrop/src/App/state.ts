import { atom } from "jotai";

// Types
export type ClaimResponse = {
  eligible: boolean;
  amount: number;
  confirmed: boolean;
  airdrop_address?: string;
};

export type Signature = {
  signature: string;
  pubKey: { type: string; value: string };
};

// State
export const KEPLR_CLAIMS = ["cosmos", "osmosis", "badkids"] as const;
export type KeplrClaimType = (typeof KEPLR_CLAIMS)[number];
export type ClaimType = "github" | "ts" | "gitcoin" | KeplrClaimType;

export type GithubState = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  type: ClaimType;
  githubToken: string;
  githubUsername: string;
};

export type KeplrState = {
  eligible: boolean;
  amount: number;
  hasClaimed: boolean;
  type: ClaimType;
  signature: Signature;
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
  signature: string;
  address: string;
  nonce: string;
  type: ClaimType;
};

export type CommonState = GithubState | KeplrState | TSState | GitcoinState;
export const claimAtom = atom<CommonState | null>(null);

export type ConfirmationState = {
  confirmed: boolean;
  address: string;
  amount: number;
};
export const confirmationAtom = atom<ConfirmationState | null>(null);
