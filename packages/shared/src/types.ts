import { TxType } from "./shared/shared";

export type TxLabel = "Bond" | "Unbond" | "Transfer" | "Withdraw" | "RevealPK";

export const TxTypeLabel: Record<TxType, TxLabel> = {
  [TxType.Bond]: "Bond",
  [TxType.Unbond]: "Unbond",
  [TxType.Transfer]: "Transfer",
  [TxType.Withdraw]: "Withdraw",
  [TxType.RevealPK]: "RevealPK",
};
