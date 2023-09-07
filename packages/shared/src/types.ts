import { TxType } from "./shared/shared";

export type TxLabel =
  | "Bond"
  | "Unbond"
  | "Transfer"
  | "IBC Transfer"
  | "Eth Bridge Transfer"
  | "Withdraw"
  | "RevealPK";

export const TxTypeLabel: Record<TxType, TxLabel> = {
  [TxType.Bond]: "Bond",
  [TxType.Unbond]: "Unbond",
  [TxType.Transfer]: "Transfer",
  [TxType.IBCTransfer]: "IBC Transfer",
  [TxType.EthBridgeTransfer]: "Eth Bridge Transfer",
  [TxType.Withdraw]: "Withdraw",
  [TxType.RevealPK]: "RevealPK",
};
