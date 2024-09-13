import {
  BondProps,
  RedelegateProps,
  TxProps,
  UnbondProps,
  VoteProposalProps,
  WithdrawProps,
} from "@namada/types";
import { ClaimRewardsProps, TxKind } from "types";

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
    "Redelegate.Success": EventData<RedelegateProps>;
    "Redelegate.PartialSuccess": EventData<RedelegateProps>;
    "Redelegate.Error": EventData<RedelegateProps>;
    "Withdraw.Success": EventData<WithdrawProps>;
    "Withdraw.Error": EventData<WithdrawProps>;
    "ClaimRewards.Success": EventData<ClaimRewardsProps>;
    "ClaimRewards.Error": EventData<ClaimRewardsProps>;
    "VoteProposal.Success": EventData<VoteProposalProps>;
    "VoteProposal.Error": EventData<VoteProposalProps>;
  }
}
