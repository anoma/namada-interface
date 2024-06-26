/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { BondProps } from "../types";
import { BigNumberSerializer } from "./utils";

export class BondMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  validator!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: BondProps) {
    Object.assign(this, data);
  }
}
