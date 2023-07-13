/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { TxMsgValue } from "./tx";
import { SubmitWithdrawProps } from "../types";

export class SubmitWithdrawMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  validator!: string;

  @field({ type: TxMsgValue })
  tx!: TxMsgValue;

  constructor(data: SubmitWithdrawProps) {
    Object.assign(this, data);
    this.tx = new TxMsgValue({ ...data.tx, publicKey: data.tx.publicKey });
  }
}
