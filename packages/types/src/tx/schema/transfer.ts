/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, vec } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import {
  TransparentTransferDataProps,
  TransparentTransferProps,
} from "../types";
import { BigNumberSerializer } from "./utils";

export class TransparentTransferDataMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  target!: string;

  @field({ type: "string" })
  token!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: TransparentTransferDataProps) {
    Object.assign(this, data);
  }
}

export class TransparentTransferMsgValue {
  @field({ type: vec(TransparentTransferDataMsgValue) })
  data!: TransparentTransferDataMsgValue[];

  constructor({ data }: TransparentTransferProps) {
    Object.assign(this, {
      data: data.map(
        (transferProps) => new TransparentTransferDataMsgValue(transferProps)
      ),
    });
  }
}
