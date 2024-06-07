import { TxType } from "./shared/shared";

export type SupportedTx = Extract<
  TxType,
  | TxType.Bond
  | TxType.Unbond
  | TxType.TransparentTransfer
  | TxType.IBCTransfer
  | TxType.EthBridgeTransfer
  | TxType.Withdraw
  | TxType.VoteProposal
  | TxType.Redelegate
>;

export type TxLabel =
  | "Bond"
  | "Unbond"
  | "Transparent Transfer"
  | "IBC Transfer"
  | "Add to Eth Bridge Pool"
  | "Withdraw"
  | "RevealPK"
  | "Vote Proposal"
  | "Redelegate";

export const TxTypeLabel: Record<TxType, TxLabel> = {
  [TxType.Bond]: "Bond",
  [TxType.Unbond]: "Unbond",
  [TxType.Withdraw]: "Withdraw",
  [TxType.TransparentTransfer]: "Transparent Transfer",
  [TxType.IBCTransfer]: "IBC Transfer",
  [TxType.EthBridgeTransfer]: "Add to Eth Bridge Pool",
  [TxType.RevealPK]: "RevealPK",
  [TxType.VoteProposal]: "Vote Proposal",
  [TxType.Redelegate]: "Redelegate",
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
