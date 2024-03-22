/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { EthBridgeTransferProps } from "../types";
import { BigNumberSerializer } from "./utils";

export class EthBridgeTransferMsgValue {
  @field({ type: "bool" })
  nut!: boolean;

  @field({ type: "string" })
  asset!: string;

  @field({ type: "string" })
  recipient!: string;

  @field({ type: "string" })
  sender!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  @field(BigNumberSerializer)
  feeAmount!: BigNumber;

  @field({ type: option("string") })
  feePayer?: string;

  @field({ type: "string" })
  feeToken!: string;

  constructor(data: EthBridgeTransferProps) {
    Object.assign(this, data);
  }
}
