import { type MetaMaskInpageProvider } from "@metamask/providers";

type MetamaskWindow = Window &
  typeof globalThis & {
    ethereum: MetaMaskInpageProvider;
  };

export type MaybeOtherEVMWindow = MetamaskWindow & {
  ethereum: MetaMaskInpageProvider & {
    isRabby?: () => boolean;
    isEnkrypt?: () => boolean;
  };
};

export type GithubClaim = {
  eligible: boolean;
  amount: number;
  github_token?: string;
  has_claimed: boolean;
  airdrop_address?: string;
  airdrop_public_key?: string;
  eligibilities: string[];
  github_username: string;
};

export type ExtensionClaim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
  airdrop_address?: string;
  airdrop_public_key?: string;
  nonce: string;
};

export type TSClaim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
  airdrop_address?: string;
  airdrop_public_key?: string;
  nonce: string;
};

export type ClaimCategory =
  | "Github"
  | "CosmosWallet"
  | "OsmosisWallet"
  | "StargazeWallet"
  | "TrustedSetup"
  | "EthereumWallet";

export type AllClaims = {
  address: string;
  claims: {
    token: number;
    value: string;
    eligible_for: string[];
    category: ClaimCategory;
  }[];
};

export type ClaimResponse = {
  eligible: boolean;
  amount: number;
  confirmed: boolean;
  airdrop_address?: string;
  airdrop_public_key?: string;
};
