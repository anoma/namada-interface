/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option, vec } from "@dao-xyz/borsh";
import { WrapperTxMsgValue } from "./wrapperTx";

export class CommitmentMsgValue {
  @field({ type: "u8" })
  txType!: number;

  @field({ type: "string" })
  hash!: string;

  @field({ type: "string" })
  txCodeId!: string;

  @field({ type: option("string") })
  memo?: string;

  @field({ type: vec("u8") })
  data!: Uint8Array;
}

export class TxDetailsMsgValue {
  @field({ type: WrapperTxMsgValue })
  wrapperTx!: WrapperTxMsgValue;

  @field({ type: vec(CommitmentMsgValue) })
  commitments!: CommitmentMsgValue[];
}
