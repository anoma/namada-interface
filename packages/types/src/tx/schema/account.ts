/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";

export class AccountMsgValue {
  @field({ type: vec("u8") })
  vpCode!: Uint8Array;

  constructor(data: AccountMsgValue) {
    Object.assign(this, data);
  }
}
