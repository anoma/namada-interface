/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from "bignumber.js";
import { field, option } from "@dao-xyz/borsh";
import { BigNumberSerializer } from "./utils";
import { TxMsgValue } from "./tx";
import { IbcTransferProps } from "../types";

export class IbcTransferMsgValue {
  @field({ type: TxMsgValue })
  tx!: InstanceType<typeof TxMsgValue>;

  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  receiver!: string;

  @field({ type: "string" })
  token!: string;

  @field({ type: option("string") })
  subPrefix?: string;

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
    this.tx = new TxMsgValue(data.tx);
  }
}
