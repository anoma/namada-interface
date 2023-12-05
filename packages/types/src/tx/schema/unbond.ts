/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from "bignumber.js";
import { field } from "@dao-xyz/borsh";
import { BigNumberSerializer } from "./utils";
import { SubmitUnbondProps } from "../types";

export class SubmitUnbondMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  validator!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: SubmitUnbondProps) {
    Object.assign(this, data);
  }
}
