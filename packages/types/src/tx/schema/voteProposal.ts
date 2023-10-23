/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { SubmitVoteProposalProps } from "../types";

export class SubmitVoteProposalMsgValue {
  @field({ type: "string" })
  signer!: string;

  @field({ type: "u64" })
  proposalId!: bigint;

  @field({ type: "string" })
  vote!: string;

  constructor(data: SubmitVoteProposalProps) {
    Object.assign(this, data);
  }
}
