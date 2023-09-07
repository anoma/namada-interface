/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option, vec } from "@dao-xyz/borsh";
import { SignatureType } from "@namada/ledger-namada";
import { SignatureProps } from "../types";

export class SignatureMsgValue {
  @field({ type: vec("u8") })
  secIndices!: Uint8Array;

  @field({ type: option(vec("u8")) })
  singlesig!: Uint8Array;

  @field({ type: "u8" })
  sigType!: SignatureType;

  @field({ type: vec("u8") })
  multisigIndices!: Uint8Array;

  @field({ type: vec(vec("u8")) })
  multisig!: Uint8Array[];

  constructor(data: SignatureProps) {
    Object.assign(this, data);
  }
}
