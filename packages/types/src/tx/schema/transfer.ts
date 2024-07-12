/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { TransferDataProps, TransferProps } from "../types";
import { BigNumberSerializer } from "./utils";

export class TransferDataMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  target!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: TransferDataProps) {
    Object.assign(this, data);
  }
}

export class TransferMsgValue {
  @field({ type: vec(TransferDataMsgValue) })
  data!: TransferDataMsgValue[];

  constructor(data: TransferProps) {
    Object.assign(this, data);
  }
}
