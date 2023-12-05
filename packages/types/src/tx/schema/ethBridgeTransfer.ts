/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from "bignumber.js";
import { field, option } from "@dao-xyz/borsh";
import { BigNumberSerializer } from "./utils";
import { BridgeTransferProps } from "../types";

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

  constructor(data: BridgeTransferProps) {
    Object.assign(this, data);
  }
}
