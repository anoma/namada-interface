/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import { BuiltTxProps } from "../../tx/types";

export class BuiltTxMsgValue {
  @field({ type: "string" })
  chainId!: string;

  @field({ type: vec("u8") })
  tx!: Uint8Array;

  @field({ type: vec("u8") })
  signingData!: Uint8Array;

  constructor(data: BuiltTxProps) {
    Object.assign(this, data);
  }
}
