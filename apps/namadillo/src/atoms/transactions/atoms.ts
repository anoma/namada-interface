import { atomWithStorage } from "jotai/utils";
import { TransferTransactionData } from "types";

export const transactionHistoryAtom = atomWithStorage<
  TransferTransactionData[]
>("namadillo:transactions", []);
