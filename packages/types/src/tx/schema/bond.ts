/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from "bignumber.js";
import { field } from "@dao-xyz/borsh";
import { BigNumberSerializer } from "./utils";
import { TxMsgValue } from "./tx";
import { SubmitBondProps } from "../types";

export class SubmitBondMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  validator!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  @field({ type: "string" })
  nativeToken!: string;

  @field({ type: TxMsgValue })
  tx!: InstanceType<typeof TxMsgValue>;

  constructor(data: SubmitBondProps) {
    Object.assign(this, data);
    this.tx = new TxMsgValue(data.tx);
  }
}
