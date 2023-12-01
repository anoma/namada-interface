import { KeplrClaimType } from "./state";
import {
  ExtensionClaim,
  GithubClaim,
  TSClaim,
  AllClaims,
  ClaimResponse,
} from "./types";
import { AirdropResponse, airdropFetch } from "./utils";

const { AIRDROP_BACKEND_SERVICE_URL: backendUrl = "" } = process.env;

export const checkTrustedSetupClaim = async (
  publicKey: string
): Promise<AirdropResponse<TSClaim>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/ts/${publicKey}`, {
    method: "GET",
  });
};

export const checkGithubClaim = async (
  code: string
): Promise<AirdropResponse<GithubClaim>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/github/${code}`, {
    method: "GET",
  });
};

export const checkExtensionClaim = async (
  address: string,
  type: KeplrClaimType | "gitcoin"
): Promise<AirdropResponse<ExtensionClaim>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/${type}/${address}`, {
    method: "GET",
  });
};

export const getAllClaims = async (
  address: string
): Promise<AirdropResponse<AllClaims>> => {
  return airdropFetch(`${backendUrl}/api/v1/claimed/${address}`, {
    method: "GET",
  });
};

export const claimWithGithub = async (
  access_token: string,
  airdrop_address: string,
  airdrop_public_key: string
): Promise<AirdropResponse<ClaimResponse>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/github`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ access_token, airdrop_address, airdrop_public_key }),
  });
};

export const claimWithKeplr = async (
  type: KeplrClaimType,
  signer_address: string,
  signer_public_key: string,
  signer_public_key_type: string,
  signature: string,
  airdrop_address: string,
  airdrop_public_key: string,
  message: string
): Promise<AirdropResponse<ClaimResponse>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/${type}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      signer_address,
      signer_public_key,
      signer_public_key_type,
      signature,
      airdrop_address,
      airdrop_public_key,
      message,
    }),
  });
};

export const claimWithGitcoin = async (
  signer_address: string,
  message: string,
  signature: string,
  airdrop_address: string,
  airdrop_public_key: string
): Promise<AirdropResponse<ClaimResponse>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/gitcoin`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      signer_address,
      message,
      signature,
      airdrop_address,
      airdrop_public_key,
    }),
  });
};

export const claimWithTrustedSetup = async (
  signer_public_key: string,
  signature: string,
  airdrop_address: string,
  airdrop_public_key: string,
  message: string
): Promise<AirdropResponse<ClaimResponse>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/ts`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      signer_public_key,
      signature,
      airdrop_address,
      airdrop_public_key,
      message,
    }),
  });
};
