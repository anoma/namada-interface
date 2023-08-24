import { TxType } from "./shared/shared";

export const TxTypeLabel: Record<TxType, string> = {
  [TxType.Bond]: "Bond",
  [TxType.Unbond]: "Unbond",
  [TxType.Transfer]: "Transfer",
  [TxType.Withdraw]: "Withdraw",
  [TxType.RevealPK]: "RevealPK",
};
