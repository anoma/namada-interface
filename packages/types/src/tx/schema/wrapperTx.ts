/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { WrapperTxProps } from "../types";
import { BigNumberSerializer } from "./utils";

export class WrapperTxMsgValue {
  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  feeAmount!: BigNumber;

  @field(BigNumberSerializer)
  gasLimit!: BigNumber;

  @field({ type: "string" })
  chainId!: string;

  @field({ type: option("string") })
  publicKey?: string;

  @field({ type: option("string") })
  memo?: string;

  constructor(data: WrapperTxProps) {
    Object.assign(this, data);
  }
}
