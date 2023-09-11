import { TxType } from "./shared/shared";

export type TxLabel =
  | "Bond"
  | "Unbond"
  | "Transfer"
  | "IBC Transfer"
  | "Add to Eth Bridge Pool"
  | "Withdraw"
  | "RevealPK";

export const TxTypeLabel: Record<TxType, TxLabel> = {
  [TxType.Bond]: "Bond",
  [TxType.Unbond]: "Unbond",
  [TxType.Transfer]: "Transfer",
  [TxType.IBCTransfer]: "IBC Transfer",
  [TxType.EthBridgeTransfer]: "Add to Eth Bridge Pool",
  [TxType.Withdraw]: "Withdraw",
  [TxType.RevealPK]: "RevealPK",
};
