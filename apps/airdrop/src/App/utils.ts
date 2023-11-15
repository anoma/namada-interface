import { NavigateFunction } from "react-router-dom";

const { NODE_ENV, AIRDROP_AUTH_SECRET = "header" } = process.env;
const AUTH_HEADER =
  NODE_ENV === "development"
    ? { "x-airdrop-secret": AIRDROP_AUTH_SECRET }
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

export const airdropFetch = (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  const requestInit = init || {};
  const initHeaders = requestInit.headers || {};
  return fetch(input, {
    ...init,
    headers: { ...initHeaders, ...AUTH_HEADER },
  });
};
