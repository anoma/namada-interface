/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { WithdrawProps } from "../types";

export class WithdrawMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  validator!: string;

  constructor(data: WithdrawProps) {
    Object.assign(this, data);
  }
}
