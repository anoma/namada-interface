/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { TxProps } from "../types";
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
  publicKey?: string;

  @field({ type: option("bool") })
  disposableSigningKey?: boolean;

  @field({ type: option("string") })
  feeUnshield?: string;

  @field({ type: option("string") })
  memo?: string;

  constructor(data: TxProps) {
    Object.assign(this, data);
  }
}
