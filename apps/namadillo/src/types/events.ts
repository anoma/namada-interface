import {
  BondProps,
  RedelegateProps,
  TxProps,
  UnbondProps,
  VoteProposalProps,
  WithdrawProps,
} from "@namada/types";

export type TransactionEventsClasses =
  | "Bond"
  | "Unbond"
  | "ReDelegate"
  | "Withdraw"
  | "VoteProposal";

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
    tx: TxProps;
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
    "ReDelegate.Success": EventData<RedelegateProps>;
    "ReDelegate.PartialSuccess": EventData<RedelegateProps>;
    "ReDelegate.Error": EventData<RedelegateProps>;
    "Withdraw.Success": EventData<WithdrawProps>;
    "Withdraw.Error": EventData<WithdrawProps>;
    "VoteProposal.Success": EventData<VoteProposalProps>;
    "VoteProposal.Error": EventData<VoteProposalProps>;
  }
}
