import { field, option, vec } from "@dao-xyz/borsh";
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
  proposalType!: string;

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
  status!: string;

  @field({ type: option(BigNumberSerializer) })
  yesVotes?: BigNumber;

  @field({ type: option(BigNumberSerializer) })
  totalVotingPower?: BigNumber;

  @field({ type: option("string") })
  result?: string;

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
