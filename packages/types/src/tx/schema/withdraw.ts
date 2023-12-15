/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { SubmitWithdrawProps } from "../types";

export class SubmitWithdrawMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  validator!: string;

  constructor(data: SubmitWithdrawProps) {
    Object.assign(this, data);
  }
}
