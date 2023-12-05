/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from "bignumber.js";
import { field } from "@dao-xyz/borsh";
import { BigNumberSerializer } from "./utils";
import { TransferProps } from "../types";

export class TransferMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  target!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  @field({ type: "string" })
  nativeToken!: string;

  constructor(data: TransferProps) {
    Object.assign(this, data);
  }
}
