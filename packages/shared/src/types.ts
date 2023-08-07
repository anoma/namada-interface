import { TxType } from "./shared/shared";
import { field, vec } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { BinaryWriter, BinaryReader } from "@dao-xyz/borsh";

export const BigNumberSerializer = {
  serialize: (value: BigNumber, writer: BinaryWriter) => {
    writer.string(value.toString());
  },
  deserialize: (reader: BinaryReader): BigNumber => {
    const valueString = reader.string();
    return new BigNumber(valueString);
  },
};

export class Proposal {
  @field({ type: "string" })
  id!: string;

  @field({ type: "string" })
  proposalType!: "pgf_steward" | "pgf_payment" | "default";

  @field({ type: "string" })
  author!: string;

  @field({ type: "u64" })
  startEpoch!: bigint;

  @field({ type: "u64" })
  endEpoch!: bigint;

  @field({ type: "u64" })
  graceEpoch!: bigint;

  @field({ type: "string" })
  contentJSON!: string;

  @field({ type: "string" })
  status!: "ongoing" | "finished" | "upcoming";

  @field({ type: "string" })
  result!: "passed" | "rejected";

  @field({ type: BigNumberSerializer })
  totalVotingPower!: BigNumber;

  @field({ type: BigNumberSerializer })
  totalYayPower!: BigNumber;

  @field({ type: BigNumberSerializer })
  totalNayPower!: BigNumber;

  constructor(data: Proposal) {
    Object.assign(this, data);
  }
}

export class Proposals {
  @field({ type: vec(Proposal) })
  proposals!: Proposal[];

  constructor(data: Proposals) {
    Object.assign(this, data);
  }
}

export type TxLabel =
  | "Bond"
  | "Unbond"
  | "Transfer"
  | "IBC Transfer"
  | "Add to Eth Bridge Pool"
  | "Withdraw"
  | "RevealPK"
  | "Vote Proposal";

export const TxTypeLabel: Record<TxType, TxLabel> = {
  [TxType.Bond]: "Bond",
  [TxType.Unbond]: "Unbond",
  [TxType.Withdraw]: "Withdraw",
  [TxType.Transfer]: "Transfer",
  [TxType.IBCTransfer]: "IBC Transfer",
  [TxType.EthBridgeTransfer]: "Add to Eth Bridge Pool",
  [TxType.RevealPK]: "RevealPK",
  [TxType.VoteProposal]: "Vote Proposal",
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
