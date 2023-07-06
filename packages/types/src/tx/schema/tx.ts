/* eslint-disable @typescript-eslint/no-unused-vars */
import BigNumber from "bignumber.js";
import { field, option } from "@dao-xyz/borsh";
import { BigNumberSerializer } from "./utils";

export class TxMsgValue {
  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  feeAmount!: BigNumber;

  @field(BigNumberSerializer)
  gasLimit!: BigNumber;

  @field({ type: "string" })
  chainId!: string;

  @field({ type: option("string") })
  publicKey!: string | undefined;

  constructor(data: TxMsgValue) {
    Object.assign(this, data);
  }
}
