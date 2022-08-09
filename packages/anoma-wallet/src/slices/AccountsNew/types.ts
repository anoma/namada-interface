export const ACCOUNTS_ACTIONS_BASE = "accounts";
export const ADD_ACCOUNT_TO_LEDGER = `${ACCOUNTS_ACTIONS_BASE}/ADD_ACCOUNT_TO_LEDGER`;

export const UPDATE_SHIELDED_BALANCES = `${ACCOUNTS_ACTIONS_BASE}/UPDATE_SHIELDED_BALANCES`;

export type NewAccountDetails = {
  alias: string;
  tokenType: "NAM" | "ATOM" | "ETH" | "DOT" | "BTC";
};

export type ShieldedAccount = {
  viewingKey: string;
  spendingKey: string;
  paymentAddress: string;
};

export enum AccountErrors {
  NonNumericShieldedBalanceReturned = "AccountErrors.NonNumericShieldedBalanceReturned",
  RetrievingShieldedBalancesFailed = "AccountErrors.RetrievingShieldedBalancesFailed",
}
