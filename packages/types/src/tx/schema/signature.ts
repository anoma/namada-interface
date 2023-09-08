/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import { SignatureProps } from "../types";

export class SignatureMsgValue {
  @field({ type: vec("u8") })
  sec_indicies!: Uint8Array;

  @field({ type: vec("u8") })
  singlesig!: Uint8Array;

  @field({ type: "u8" })
  sigType!: number;

  @field({ type: vec("u8") })
  multisigIndicies!: Uint8Array;

  @field({ type: vec("u8") })
  multisig!: Uint8Array[];

  constructor(data: SignatureProps) {
    Object.assign(this, data);
  }
}
