import { BinaryReader, BinaryWriter, field, option, vec } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";

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
  @field({ type: "u64" })
  id!: bigint;

  @field({ type: "string" })
  content!: string;

  @field({ type: "string" })
  author!: string;

  @field({ type: "u64" })
  startEpoch!: bigint;

  @field({ type: "u64" })
  endEpoch!: bigint;

  @field({ type: "u64" })
  graceEpoch!: bigint;

  @field({ type: "string" })
  tallyType!: string;

  @field({ type: "string" })
  proposalType!: string;

  @field({ type: option("string") })
  data?: string;

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
