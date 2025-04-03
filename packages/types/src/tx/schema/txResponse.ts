/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import { TxResponseProps } from "../types";
import { BatchTxResultMsgValue } from "./batchTxResult";

export class TxResponseMsgValue {
  @field({ type: "u8" })
  code!: number;

  @field({ type: vec(BatchTxResultMsgValue) })
  commitments!: BatchTxResultMsgValue[];

  @field({ type: "string" })
  gasUsed!: string;

  @field({ type: "string" })
  hash!: string;

  @field({ type: "string" })
  height!: string;

  @field({ type: "string" })
  info!: string;

  @field({ type: "string" })
  log!: string;

  constructor(data: TxResponseProps) {
    Object.assign(this, data);
  }
}
