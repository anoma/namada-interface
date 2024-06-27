/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import { CommitmentProps, TxProps } from "../../tx/types";

export class CommitmentMsgValue {
  @field({ type: "u8" })
  txType!: number;

  @field({ type: vec("u8") })
  data!: Uint8Array;

  constructor(data: CommitmentProps) {
    Object.assign(this, data);
  }
}

export class TxMsgValue {
  @field({ type: vec("u8") })
  wrapperTx!: Uint8Array;

  @field({ type: vec(CommitmentMsgValue) })
  commitments!: CommitmentMsgValue[];

  constructor(data: TxProps) {
    Object.assign(this, data);
  }
}
