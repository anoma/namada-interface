import {
  BondProps,
  RedelegateProps,
  ShieldedTransferProps,
  ShieldingTransferProps,
  TransparentTransferProps,
  TxProps,
  UnbondProps,
  UnshieldingTransferProps,
  VoteProposalProps,
  WithdrawProps,
} from "@namada/types";
import { ClaimRewardsProps, IbcTransferTransactionData } from "types";
import { TxKind } from "types/txKind";

export type TransactionEventsClasses = Partial<TxKind>;

export type TransactionEventsStatus =
  | "Pending"
  | "Error"
  | "Success"
  | "PartialSuccess";

export type TransactionEvent =
  `${TransactionEventsClasses}.${TransactionEventsStatus}`;

export type TransactionEventHandlers = {
  onError?: TransactionEvent;
  onSuccess?: TransactionEvent;
  onPending?: TransactionEvent;
};

export interface EventData<T> extends CustomEvent {
  detail: {
    tx: TxProps[];
    data: T[];
    // If event is for PartialSuccess, use the following:
    successData?: T[];
    failedData?: T[];
    error?: Error;
  };
}

declare global {
  interface WindowEventMap {
    "Bond.Success": EventData<BondProps>;
    "Bond.PartialSuccess": EventData<BondProps>;
    "Bond.Error": EventData<BondProps>;
    "Unbond.Success": EventData<UnbondProps>;
    "Unbond.PartialSuccess": EventData<UnbondProps>;
    "Unbond.Error": EventData<UnbondProps>;
    "Redelegate.Success": EventData<RedelegateProps>;
    "Redelegate.PartialSuccess": EventData<RedelegateProps>;
    "Redelegate.Error": EventData<RedelegateProps>;
    "Withdraw.Success": EventData<WithdrawProps>;
    "Withdraw.Error": EventData<WithdrawProps>;
    "ClaimRewards.Success": EventData<ClaimRewardsProps>;
    "ClaimRewards.Error": EventData<ClaimRewardsProps>;
    "VoteProposal.Success": EventData<VoteProposalProps>;
    "VoteProposal.Error": EventData<VoteProposalProps>;
    "TransparentTransfer.Success": EventData<TransparentTransferProps>;
    "TransparentTransfer.Error": EventData<TransparentTransferProps>;
    "ShieldedTransfer.Success": EventData<ShieldedTransferProps>;
    "ShieldedTransfer.Error": EventData<ShieldedTransferProps>;
    "ShieldingTransfer.Success": EventData<ShieldingTransferProps>;
    "ShieldingTransfer.Error": EventData<ShieldingTransferProps>;
    "UnshieldingTransfer.Success": EventData<UnshieldingTransferProps>;
    "UnshieldingTransfer.Error": EventData<UnshieldingTransferProps>;
    "IbcTransfer.Success": CustomEvent<IbcTransferTransactionData>;
    "IbcTransfer.Error": CustomEvent<IbcTransferTransactionData>;
    "IbcWithdraw.Success": CustomEvent<IbcTransferTransactionData>;
    "IbcWithdraw.Error": CustomEvent<IbcTransferTransactionData>;
  }
}
