export const txKinds = [
  "Bond",
  "Unbond",
  "Redelegate",
  "Withdraw",
  "ClaimRewards",
  "VoteProposal",
  "RevealPk",
  "IbcTransfer",
  "TransparentTransfer",
  "ShieldedTransfer",
  "ShieldingTransfer",
  "UnshieldingTransfer",
  "Unknown",
] as const;

export type TxKind = (typeof txKinds)[number];
export type TxKinds = TxKind | TxKind[];
