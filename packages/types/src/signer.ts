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
    txProps: BondProps | BondProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void>;
  submitUnbond(
    txProps: UnbondProps | UnbondProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void>;
  submitWithdraw(
    txProps: WithdrawProps | WithdrawProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void>;
  submitTransfer(
    txProps: TransferProps | TransferProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void>;
  submitIbcTransfer(
    txProps: IbcTransferProps | IbcTransferProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void>;
  submitVoteProposal(
    txProps: VoteProposalProps | VoteProposalProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void>;
  submitEthBridgeTransfer(
    txProps: EthBridgeTransferProps | EthBridgeTransferProps[],
    wrapperTxProps: TxProps,
    type: AccountType
  ): Promise<void>;
}
