export const txKinds = [
  "Bond",
  "Unbond",
  "Redelegate",
  "Withdraw",
  "ClaimRewards",
  "VoteProposal",
  "RevealPk",
  "IbcTransfer",
  "Shield",
  "Unshield",
  "Unknown",
] as const;

export type TxKind = (typeof txKinds)[number];
