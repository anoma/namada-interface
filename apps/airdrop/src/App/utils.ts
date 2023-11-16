import _toast, { Toast } from "react-simple-toasts";
import { NavigateFunction } from "react-router-dom";

const { NODE_ENV, AIRDROP_AUTH_SECRET = "header" } = process.env;
const AUTH_HEADER =
  NODE_ENV === "development"
    ? // NODE_ENV === "production"
      { "x-airdrop-secret": AIRDROP_AUTH_SECRET }
    : null;

export const navigatePostCheck = (
  navigate: NavigateFunction,
  eligible: boolean,
  hasClaimed: boolean,
  replace = false
): void => {
  if (eligible && !hasClaimed) {
    navigate("/claim/info", { replace });
  } else if (eligible && hasClaimed) {
    navigate("/airdrop-confirmed", { replace });
  } else if (!eligible) {
    navigate("/non-eligible", { replace });
  }
};

type AirdropResponseErr = { message: string; code: number };
export type AirdropResponse<T> =
  | { ok: true; result: T }
  | { ok: false; result: AirdropResponseErr };

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

  return response.ok ? { ok: true, result } : { ok: false, result };
};

export const toast = (msg: string): Toast =>
  _toast(msg, {
    className: "failure-toast",
  });
