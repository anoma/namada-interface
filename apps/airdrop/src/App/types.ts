import { type MetaMaskInpageProvider } from "@metamask/providers";

export type MetamaskWindow = Window &
  typeof globalThis & {
    ethereum: MetaMaskInpageProvider;
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

export type Claim = {
  eligible: boolean;
  amount: number;
  has_claimed: boolean;
  airdrop_address?: string;
  airdrop_public_key?: string;
  nonce: string;
};
