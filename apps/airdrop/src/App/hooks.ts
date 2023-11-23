import { useCallback } from "react";
import { type MetaMaskInpageProvider } from "@metamask/providers";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { KeplrClaimType, claimAtom, confirmationAtom } from "./state";
import {
  AirdropResponse,
  airdropFetch,
  navigatePostCheck,
  toast,
} from "./utils";
import { Claim, GithubClaim } from "./types";
import { Keplr } from "@keplr-wallet/types";

const { AIRDROP_BACKEND_SERVICE_URL: backendUrl = "" } = process.env;

export const handleExtensionDownload = (url: string): void => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const checkGithubClaim = async (
  code: string
): Promise<AirdropResponse<GithubClaim>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/github/${code}`, {
    method: "GET",
  });
};

const checkClaim = async (
  address: string,
  type: KeplrClaimType | "gitcoin"
): Promise<AirdropResponse<Claim>> => {
  return airdropFetch(`${backendUrl}/api/v1/airdrop/${type}/${address}`, {
    method: "GET",
  });
};

//TODO: move to types
export type ClaimCategory =
  | "Github"
  | "CosmosWallet"
  | "OsmosisWallet"
  | "StargazeWallet"
  | "TrustedSetup"
  | "EthereumWallet";

type AllClaims = {
  address: string;
  claims: {
    token: number;
    value: string;
    eligible_for: string[];
    category: ClaimCategory;
  }[];
};

//TODO: maybe a hook?
export const getAllClaims = async (
  address: string
): Promise<AirdropResponse<AllClaims>> => {
  return airdropFetch(`${backendUrl}/api/v1/claim/${address}`, {
    method: "GET",
  });
};

export const useMetamaskHandler = (
  chainId: string,
  metamask?: MetaMaskInpageProvider
): (() => Promise<void>) => {
  const navigate = useNavigate();
  const [_cl, setClaim] = useAtom(claimAtom);
  const [_co, setConfirmation] = useAtom(confirmationAtom);

  const handleMetamask = useCallback(async () => {
    if (!metamask) {
      handleExtensionDownload("https://metamask.io/download/");
    } else {
      await metamask.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });

      const addresses = await metamask.request<string[]>({
        method: "eth_requestAccounts",
      });

      if (!addresses || !addresses[0]) {
        throw new Error("No address found");
      }
      const address = addresses[0];

      let response: AirdropResponse<Claim> | undefined;
      try {
        response = await checkClaim(address, "gitcoin");
      } catch (e) {
        console.error(e);
      }
      if (!response) {
        toast("Something went wrong, please try again later");
        return;
      } else if (!response.ok) {
        toast(response.result.message);
        return;
      }
      const { result } = response;

      let signature;
      if (result.eligible && !result.has_claimed) {
        signature = await metamask.request<string>({
          method: "personal_sign",
          params: [result.nonce, address],
        });

        if (!signature) {
          throw new Error("Can't sign message");
        }
      } else if (result.eligible && result.has_claimed) {
        setConfirmation({
          confirmed: true,
          address: result.airdrop_address as string,
          amount: result.amount,
        });
      }

      setClaim({
        eligible: result.eligible,
        amount: result.amount,
        hasClaimed: result.has_claimed,
        signature,
        address,
        nonce: result.nonce,
        type: "gitcoin" as const,
      });

      navigatePostCheck(navigate, result.eligible, result.has_claimed);
    }
  }, [metamask]);

  return handleMetamask;
};

export const useKeplrHandler = (
  chainId: string,
  type: KeplrClaimType,
  keplr?: Keplr
): (() => Promise<void>) => {
  const navigate = useNavigate();
  const [_cl, setClaim] = useAtom(claimAtom);
  const [_co, setConfirmation] = useAtom(confirmationAtom);

  const handleKeplr = useCallback(async () => {
    if (!keplr) {
      handleExtensionDownload("https://www.keplr.app/download");
    } else {
      try {
        await keplr.enable(chainId);
      } catch (e) {
        alert("Please install Keplr extension and refresh the website");
      }

      const { bech32Address: address } = await keplr.getKey(chainId);

      let response: AirdropResponse<Claim> | undefined;
      try {
        response = await checkClaim(address, type);
      } catch (e) {
        console.error(e);
      }

      if (!response) {
        toast("Something went wrong, please try again later");
        return;
      } else if (!response.ok) {
        toast(response.result.message);
        return;
      }
      const claim = response.result;

      let signature;
      if (claim.eligible && !claim.has_claimed) {
        signature = await keplr?.signArbitrary(chainId, address, claim.nonce);
      } else if (claim.eligible && claim.has_claimed) {
        setConfirmation({
          confirmed: true,
          address: claim.airdrop_address as string,
          amount: claim.amount,
        });
      }

      setClaim({
        eligible: claim.eligible,
        amount: claim.amount,
        hasClaimed: claim.has_claimed,
        type,
        signature: signature
          ? { ...signature, pubKey: signature.pub_key }
          : undefined,
        address,
        nonce: claim.nonce,
      });

      navigatePostCheck(navigate, claim.eligible, claim.has_claimed);
    }
  }, [keplr]);

  return handleKeplr;
};

export const useGithubHandler = (): ((code: string) => Promise<void>) => {
  const navigate = useNavigate();
  const [_cl, setClaim] = useAtom(claimAtom);
  const [_co, setConfirmation] = useAtom(confirmationAtom);

  const handleGithub = useCallback(async (code: string) => {
    let response: AirdropResponse<GithubClaim> | undefined;
    //TODO: generic error handling
    try {
      response = await checkGithubClaim(code);
    } catch (e) {
      console.error(e);
      navigate("/", { replace: true });
    }

    if (!response) {
      toast("Something went wrong, please try again later");
      return;
    } else if (!response.ok) {
      toast(response.result.message);
      return;
    }
    const claim = response.result;

    if (claim.eligible && claim.has_claimed) {
      setConfirmation({
        confirmed: true,
        address: claim.airdrop_address as string,
        amount: claim.amount,
      });
    }

    setClaim({
      eligible: claim.eligible,
      amount: claim.amount,
      githubToken: claim.github_token,
      githubUsername: claim.github_username,
      hasClaimed: claim.has_claimed,
      eligibilities: claim.eligibilities,
      type: "github",
    });

    navigatePostCheck(navigate, claim.eligible, claim.has_claimed, true);
  }, []);

  return handleGithub;
};
