import { atom } from "jotai";
import { PreparedTransaction } from "lib/query";

export type DispatchTransaction = (txs: PreparedTransaction[]) => Promise<void>;

const transactionsBaseAtom = atom<PreparedTransaction[]>([]);
export const transactionsAtom = atom<PreparedTransaction[]>((get) =>
  get(transactionsBaseAtom)
);

export const dispatchTransactionsAtom = atom(
  null,
  (get, set, transactions: PreparedTransaction[]) => {
    const queuedTransactions = get(transactionsAtom);
    set(transactionsBaseAtom, [...queuedTransactions, ...transactions]);
  }
);

export const clearTransactionQueueAtom = atom(null, (_get, set) => {
  set(transactionsBaseAtom, []);
});
