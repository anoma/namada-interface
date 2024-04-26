import { field } from "@dao-xyz/borsh";
import BigNumber from "bignumber.js";
import { RedelegateProps } from "../types";
import { BigNumberSerializer } from "./utils";

export class RedelegateMsgValue {
  @field({ type: "string" })
  owner!: string;

  @field({ type: "string" })
  sourceValidator!: string;

  @field({ type: "string" })
  destinationValidator!: string;

  @field(BigNumberSerializer)
  amount!: BigNumber;

  constructor(data: RedelegateProps) {
    Object.assign(this, data);
  }
}
