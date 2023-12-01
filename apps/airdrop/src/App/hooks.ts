import { useCallback } from "react";
import { type MetaMaskInpageProvider } from "@metamask/providers";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { KeplrClaimType, claimAtom, confirmationAtom } from "./state";
import {
  AirdropResponse,
  ToastMessage,
  handleExtensionDownload,
  navigatePostCheck,
  toast,
} from "./utils";
import { ExtensionClaim, GithubClaim } from "./types";
import { Keplr } from "@keplr-wallet/types";
import { checkExtensionClaim, checkGithubClaim } from "./claimService";

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

      let response: AirdropResponse<ExtensionClaim> | undefined;
      try {
        response = await checkExtensionClaim(address, "gitcoin");
      } catch (e) {
        console.error(e);
      }
      if (!response) {
        toast(ToastMessage.SOMETHING_WENT_WRONG);
        return;
      } else if (!response.ok) {
        toast(
          ToastMessage.SOMETHING_WENT_WRONG_WITH_ERR(response.error.message)
        );
        return;
      }
      const { value: result } = response;

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
          publicKey: result.airdrop_public_key as string,
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
        toast("Please allow Keplr to connect to this website");
        return;
      }

      const { bech32Address: address } = await keplr.getKey(chainId);

      let response: AirdropResponse<ExtensionClaim> | undefined;
      try {
        response = await checkExtensionClaim(address, type);
      } catch (e) {
        console.error(e);
      }

      if (!response) {
        toast(ToastMessage.SOMETHING_WENT_WRONG);
        return;
      } else if (!response.ok) {
        toast(
          ToastMessage.SOMETHING_WENT_WRONG_WITH_ERR(response.error.message)
        );
        return;
      }
      const claim = response.value;

      let signature;
      if (claim.eligible && !claim.has_claimed) {
        //We need to give some time to Keplr to enable itself, otherwise it will fail first time after enabling
        await new Promise((resolve) => setTimeout(resolve, 500));
        signature = await keplr?.signArbitrary(chainId, address, claim.nonce);
      } else if (claim.eligible && claim.has_claimed) {
        setConfirmation({
          confirmed: true,
          address: claim.airdrop_address as string,
          publicKey: claim.airdrop_public_key as string,
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
    try {
      response = await checkGithubClaim(code);
    } catch (e) {
      toast(ToastMessage.SOMETHING_WENT_WRONG_WITH_ERR(e));
      navigate("/", { replace: true });
    }

    if (!response) {
      toast(ToastMessage.SOMETHING_WENT_WRONG);
      return;
    } else if (!response.ok) {
      toast(ToastMessage.SOMETHING_WENT_WRONG_WITH_ERR(response.error.message));
      return;
    }
    const claim = response.value;

    if (claim.eligible && claim.has_claimed) {
      setConfirmation({
        confirmed: true,
        address: claim.airdrop_address as string,
        publicKey: claim.airdrop_public_key as string,
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
