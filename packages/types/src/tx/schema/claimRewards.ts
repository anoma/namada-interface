/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { ClaimRewardsProps } from "../types";

export class ClaimRewardsMsgValue {
  @field({ type: "string" })
  source!: string;

  @field({ type: "string" })
  validator!: string;

  constructor(data: ClaimRewardsProps) {
    Object.assign(this, data);
  }
}
