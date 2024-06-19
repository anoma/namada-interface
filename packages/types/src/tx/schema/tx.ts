/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import { TxProps } from "../types";

export class TxMsgValue {
  @field({ type: "string" })
  hash!: string;

  @field({ type: "u8" })
  txType!: number;

  @field({ type: vec("u8") })
  txBytes!: Uint8Array;

  @field({ type: vec(vec("u8")) })
  signingData!: string;

  constructor(data: TxProps) {
    Object.assign(this, data);
  }
}
