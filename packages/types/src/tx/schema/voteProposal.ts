/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { VoteProposalProps } from "../types";

export class VoteProposalMsgValue {
  @field({ type: "string" })
  signer!: string;

  @field({ type: "u64" })
  proposalId!: bigint;

  @field({ type: "string" })
  vote!: string;

  constructor(data: VoteProposalProps) {
    Object.assign(this, data);
  }
}
