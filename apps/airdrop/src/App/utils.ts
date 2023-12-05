import { type MetaMaskInpageProvider } from "@metamask/providers";
import { Result } from "@namada/utils";
import _toast, { Toast } from "react-simple-toasts";
import { NavigateFunction } from "react-router-dom";
import { Label } from "./state";
import { MaybeOtherEVMWindow } from "./types";

const { NODE_ENV, NAMADA_INTERFACE_AIRDROP_AUTH_SECRET = "header" } = process.env;
const AUTH_HEADER =
  NODE_ENV === "development"
    ? // NODE_ENV === "production"
      { "x-airdrop-secret": NAMADA_INTERFACE_AIRDROP_AUTH_SECRET }
    : null;

export const navigatePostCheck = (
  navigate: NavigateFunction,
  eligible: boolean,
  hasClaimed: boolean,
  replace = false
): void => {
  if (eligible && !hasClaimed) {
    navigate("/claim/eligible", { replace });
  } else if (eligible && hasClaimed) {
    navigate("/claim-confirmed", { replace });
  } else if (!eligible) {
    navigate("/non-eligible", { replace });
  }
};

type AirdropResponseErr = { message: string; code: number };
export type AirdropResponse<T> = Result<T, AirdropResponseErr>;

export const airdropFetch = async <T>(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<AirdropResponse<T>> => {
  const requestInit = init || {};
  const initHeaders = requestInit.headers || {};

  const response = await fetch(input, {
    ...init,
    headers: { ...initHeaders, ...AUTH_HEADER },
  });
  const result = await response.json();

  return response.ok
    ? { ok: true, value: result }
    : { ok: false, error: result };
};

export const toast = (msg: string): Toast =>
  _toast(msg, {
    className: "failure-toast",
  });

export const labelTextMap: Record<Label["type"], string> = {
  address: "Wallet address",
  publicKey: "Public key",
  username: "Github username",
  unknown: "",
};

export const handleExtensionDownload = (url: string): void => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export const ToastMessage = {
  SOMETHING_WENT_WRONG: "Something went wrong, please try again later",
  SOMETHING_WENT_WRONG_WITH_ERR: (err: unknown) =>
    `Something went wrong: ${err}`,
};

export const formatAmount = (amount: number): number => {
  return Math.floor(amount * 100) / 100;
};

export const getMetamask = (): MetaMaskInpageProvider | undefined => {
  const provider = (window as MaybeOtherEVMWindow).ethereum;

  if (
    provider?.isMetaMask &&
    !Boolean(provider.isRabby) &&
    !Boolean(provider.isEnkrypt)
  ) {
    return provider;
  }
};
