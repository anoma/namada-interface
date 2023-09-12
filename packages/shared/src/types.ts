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

type TransferToEthereumKind = "Erc20" | "Nut";

export type TransferToEthereum = {
  /// The kind of transfer to Ethereum.
  kind: TransferToEthereumKind;
  /// The type of token
  asset: string;
  /// The recipient address
  recipient: string;
  /// The sender of the transfer
  sender: string;
  /// The amount to be transferred
  amount: string;
};
