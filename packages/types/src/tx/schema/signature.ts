/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import { SignatureProps } from "../types";

export class SignatureMsgValue {
  @field({ type: vec("u8") })
  salt!: Uint8Array;

  @field({ type: vec("u8") })
  indices!: Uint8Array;

  @field({ type: vec("u8") })
  pubkey!: Uint8Array;

  @field({ type: vec("u8") })
  signature!: Uint8Array;

  constructor(data: SignatureProps) {
    Object.assign(this, data);
  }
}
