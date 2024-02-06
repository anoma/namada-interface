import { Account, AccountType } from "./account";
import {
  BridgeTransferProps,
  IbcTransferProps,
  SubmitBondProps,
  SubmitUnbondProps,
  SubmitVoteProposalProps,
  SubmitWithdrawProps,
  TransferProps,
  TxProps,
} from "./tx";

export type SignatureResponse = {
  hash: string;
  signature: string;
};

export interface Signer {
  accounts: (chainId?: string) => Promise<Account[] | undefined>;
  defaultAccount: (chainId?: string) => Promise<Account | undefined>;
  sign: (
    signer: string,
    data: string
  ) => Promise<SignatureResponse | undefined>;
  verify: (publicKey: string, hash: string, signature: string) => Promise<void>;
  submitBond(
    args: SubmitBondProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitUnbond(
    args: SubmitUnbondProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitWithdraw(
    args: SubmitWithdrawProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitTransfer(
    args: TransferProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitIbcTransfer(
    args: IbcTransferProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitVoteProposal(
    args: SubmitVoteProposalProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitEthBridgeTransfer(
    args: BridgeTransferProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
}
