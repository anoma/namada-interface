import { Keplr, Window as KeplrWindow } from "@keplr-wallet/types";

export const getKeplrWallet = (): Keplr => {
  const wallet = (window as KeplrWindow).keplr;
  if (typeof wallet === "undefined") {
    throw new Error("No Keplr instance");
  }
  return wallet;
};

export const sanitizeChannel = (channel: string): string => {
  const numericValue = channel.replace(/[^0-9]/g, "");
  return `channel-${numericValue}`;
};
