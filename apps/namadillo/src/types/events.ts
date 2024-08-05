import {
  BondProps,
  RedelegateProps,
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

export type TransactionEventsStatus = "Pending" | "Error" | "Success";

export type TransactionEvent =
  `${TransactionEventsClasses}.${TransactionEventsStatus}`;

export type TransactionEventHandlers = {
  onError?: TransactionEvent;
  onSuccess?: TransactionEvent;
  onPending?: TransactionEvent;
};

export interface EventData<T> extends CustomEvent {
  detail: {
    transactionId: string;
    data: T;
    error?: Error;
  };
}

declare global {
  interface WindowEventMap {
    "Bond.Success": EventData<BondProps>;
    "Bond.Error": EventData<BondProps>;
    "Unbond.Success": EventData<UnbondProps>;
    "Unbond.Error": EventData<UnbondProps>;
    "ReDelegate.Success": EventData<RedelegateProps>;
    "ReDelegate.Error": EventData<RedelegateProps>;
    "Withdraw.Success": EventData<WithdrawProps>;
    "Withdraw.Error": EventData<WithdrawProps>;
    "VoteProposal.Success": EventData<VoteProposalProps>;
    "VoteProposal.Error": EventData<VoteProposalProps>;
  }
}
