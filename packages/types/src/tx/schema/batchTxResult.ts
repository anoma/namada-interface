/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { BatchTxResultProps } from "../types";

export class BatchTxResultMsgValue {
  @field({ type: "string" })
  hash!: string;

  @field({ type: "bool" })
  isApplied!: string;

  constructor(data: BatchTxResultProps) {
    Object.assign(this, data);
  }
}
