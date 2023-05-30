/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { TxMsgValue } from "./tx";
import { RevealPKProps } from "../types";

export class SubmitRevealPKMsgValue {
  @field({ type: TxMsgValue })
  tx!: InstanceType<typeof TxMsgValue>;

  @field({ type: "string" })
  publicKey!: string;

  constructor(data: RevealPKProps) {
    Object.assign(this, data);
    this.tx = new TxMsgValue(data.tx);
  }
}
