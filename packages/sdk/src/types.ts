// TODO: The props in @namada/types should have consistent naming to match the exports below
import {
  SubmitBondProps as Bond,
  BridgeTransferProps as Bridge,
  IbcTransferProps as Ibc,
  SubmitVoteProposalProps as Proposal,
  SignatureProps as Signature,
  TransferProps as Transfer,
  TxProps as Tx,
  SubmitUnbondProps as Unbond,
  SubmitVoteProposalProps as VoteProposal,
  SubmitWithdrawProps as Withdraw,
} from "@namada/types";

/**
 * Re-exported types from @namada/types
 */
export type BondProps = Bond;
export type BridgeProps = Bridge;
export type IbcProps = Ibc;
export type ProposalProps = Proposal;
export type SignatureProps = Signature;
export type TransferProps = Transfer;
export type TxProps = Tx;
export type UnondProps = Unbond;
export type VoteProposalProps = VoteProposal;
export type WithdrawProps = Withdraw;
