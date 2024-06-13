/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import { TxResponseProps } from "../types";
import { BatchTxResultMsgValue } from "./batchTxResult";

export class TxResponseMsgValue {
  @field({ type: "string" })
  hash!: string;

  @field({ type: "string" })
  gasUsed!: string;

  @field({ type: vec(BatchTxResultMsgValue) })
  commitments!: BatchTxResultMsgValue[];

  constructor(data: TxResponseProps) {
    Object.assign(this, data);
  }
}
