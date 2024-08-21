/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option, vec } from "@dao-xyz/borsh";
import { TxProps } from "../types";
import { WrapperTxMsgValue } from "./wrapperTx";

// TODO: Implement this in Rust
export class SigningDataMsgValue {
  @field({ type: vec("string") })
  publicKeys!: string[];

  @field({ type: "u8" })
  threshold!: number;

  @field({ type: "string" })
  feePayer!: string;

  @field({ type: option(vec("u8")) })
  accountPublicKeysMap?: Uint8Array[];

  @field({ type: option("string") })
  owner?: string;

  constructor(data: TxProps) {
    Object.assign(this, data);
  }
}

export class TxMsgValue {
  @field({ type: WrapperTxMsgValue })
  args!: WrapperTxMsgValue;

  @field({ type: "string" })
  hash!: string;

  @field({ type: vec("u8") })
  bytes!: Uint8Array;

  // TODO: Convert to SigningData as defined above
  @field({ type: vec(vec("u8")) })
  signingDataBytes!: Uint8Array[];

  constructor(data: TxProps) {
    Object.assign(this, data);
  }
}
