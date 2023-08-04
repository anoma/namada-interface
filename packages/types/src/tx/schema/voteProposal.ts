/* eslint-disable @typescript-eslint/no-unused-vars */
import { field } from "@dao-xyz/borsh";
import { TxMsgValue } from "./tx";
import { SubmitVoteProposalProps } from "../types";

export class SubmitVoteProposalMsgValue {
  @field({ type: "string" })
  signer!: string;

  @field({ type: "u64" })
  proposalId!: bigint;

  @field({ type: "string" })
  vote!: string;

  @field({ type: TxMsgValue })
  tx!: TxMsgValue;

  constructor(data: SubmitVoteProposalProps) {
    Object.assign(this, data);
    this.tx = new TxMsgValue({ ...data.tx, publicKey: data.tx.publicKey });
  }
}
