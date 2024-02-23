import { Account, AccountType } from "./account";
import {
  BondProps,
  EthBridgeTransferProps,
  IbcTransferProps,
  TransferProps,
  TxProps,
  UnbondProps,
  VoteProposalProps,
  WithdrawProps,
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
    args: BondProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitUnbond(
    args: UnbondProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitWithdraw(
    args: WithdrawProps,
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
    args: VoteProposalProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
  submitEthBridgeTransfer(
    args: EthBridgeTransferProps,
    txArgs: TxProps,
    type: AccountType
  ): Promise<void>;
}
