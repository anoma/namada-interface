import {
  ChainInfo,
  Currency as KeplrCurrency,
  IBCCurrency as KeplrIBCCurrency,
} from "@keplr-wallet/types";

// Alias types from keplr-wallet so we can update as needed from a single point
export type Chain = ChainInfo;
export type Currency = KeplrCurrency;
export type IBCCurrency = KeplrIBCCurrency;
