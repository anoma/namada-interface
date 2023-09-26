/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import { SignatureProps } from "../types";

export class SignatureMsgValue {
  @field({ type: vec("u8") })
  pubkey!: Uint8Array;

  @field({ type: vec("u8") })
  rawIndices!: Uint8Array;

  @field({ type: vec("u8") })
  rawSignature!: Uint8Array;

  @field({ type: vec("u8") })
  wrapperIndices!: Uint8Array;

  @field({ type: vec("u8") })
  wrapperSignature!: Uint8Array;

  constructor(data: SignatureProps) {
    Object.assign(this, data);
  }
}
