export type TransactionEventsClasses =
  | "Bond"
  | "Unbond"
  | "ReDelegate"
  | "Withdraw";

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
