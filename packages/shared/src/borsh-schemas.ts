import { BinaryReader, BinaryWriter, field, vec } from "@dao-xyz/borsh";
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
