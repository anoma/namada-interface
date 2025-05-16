/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option } from "@dao-xyz/borsh";
import { BatchTxResultProps } from "../types";

export class BatchTxResultMsgValue {
  @field({ type: "string" })
  hash!: string;

  @field({ type: "bool" })
  isApplied!: string;

  @field({ type: option("string") })
  error?: string;

  constructor(data: BatchTxResultProps) {
    Object.assign(this, data);
  }
}
