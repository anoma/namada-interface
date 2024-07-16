/* eslint-disable @typescript-eslint/no-unused-vars */
import { field, option } from "@dao-xyz/borsh";
import { ClaimRewardsProps } from "../types";

export class ClaimRewardsMsgValue {
  @field({ type: "string" })
  validator!: string;

  @field({ type: option("string") })
  source?: string;

  constructor(data: ClaimRewardsProps) {
    Object.assign(this, data);
  }
}
