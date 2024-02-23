/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { IbcTransferProps } from "../types";
import { BigNumberSerializer } from "./utils";

export class IbcTransferMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  receiver!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  @field({ type: "string" })
  portId!: string;

  @field({ type: "string" })
  channelId!: string;

  @field({ type: option("u64") })
  timeoutHeight?: bigint;

  @field({ type: option("u64") })
  timeoutSecOffset?: bigint;

  constructor(data: IbcTransferProps) {
    Object.assign(this, data);
  }
}
