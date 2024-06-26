/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { TransparentTransferProps } from "../types";
import { BigNumberSerializer } from "./utils";

export class TransparentTransferMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  target!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: TransparentTransferProps) {
    Object.assign(this, data);
  }
}
