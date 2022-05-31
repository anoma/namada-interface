export const ACCOUNTS_ACTIONS_BASE = "accounts";
export const ADD_ACCOUNT_TO_LEDGER = `${ACCOUNTS_ACTIONS_BASE}/ADD_ACCOUNT_TO_LEDGER`;

export type NewAccountDetails = {
  alias: string;
  isShielded: boolean;
  tokenType: "NAM" | "BTC" | "ETH" | "DOT";
};

export type ShieldedAccount = {
  viewingKey: string;
  spendingKey: string;
  paymentAddress: string;
};
