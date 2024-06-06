import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { shouldUpdateBalanceAtom } from "slices/etc";
import {
  fetchAccountBalance,
  fetchAccounts,
  fetchDefaultAccount,
} from "./services";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

export const accountsAtom = atomWithQuery<readonly Account[]>(() => {
  return {
    queryKey: ["fetch-accounts"],
    queryFn: fetchAccounts,
  };
});

export const defaultAccountAtom = atomWithQuery<Account | undefined>(() => {
  return {
    queryKey: ["default-account"],
    queryFn: fetchDefaultAccount,
  };
});

export const accountBalanceAtom = atomWithQuery<BigNumber>((get) => {
  const defaultAccount = get(defaultAccountAtom);
  const enablePolling = get(shouldUpdateBalanceAtom);
  return {
    enabled: !!tokenAddress && defaultAccount.isSuccess,
    // TODO: subscribe to indexer events when it's done
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["balances", tokenAddress, defaultAccount],
    queryFn: async () => fetchAccountBalance(defaultAccount.data, tokenAddress),
  };
});
