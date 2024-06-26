import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { indexerApiAtom } from "slices/api";
import { nativeTokenAddressAtom } from "slices/chainParameters";
import { shouldUpdateBalanceAtom } from "slices/etc";
import { namadaExtensionConnectedAtom } from "slices/settings";
import { queryDependentFn } from "store/utils";
import {
  fetchAccountBalance,
  fetchAccounts,
  fetchDefaultAccount,
} from "./services";

export const accountsAtom = atomWithQuery<readonly Account[]>((get) => {
  const isExtensionConnected = get(namadaExtensionConnectedAtom);
  return {
    enabled: isExtensionConnected,
    queryKey: ["fetch-accounts", isExtensionConnected],
    queryFn: fetchAccounts,
  };
});

export const defaultAccountAtom = atomWithQuery<Account | undefined>((get) => {
  const isExtensionConnected = get(namadaExtensionConnectedAtom);
  return {
    enabled: isExtensionConnected,
    queryKey: ["default-account", isExtensionConnected],
    queryFn: fetchDefaultAccount,
  };
});

export const accountBalanceAtom = atomWithQuery<BigNumber>((get) => {
  const defaultAccount = get(defaultAccountAtom);
  const tokenAddress = get(nativeTokenAddressAtom);
  const enablePolling = get(shouldUpdateBalanceAtom);
  const api = get(indexerApiAtom);

  return {
    // TODO: subscribe to indexer events when it's done
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["balances", tokenAddress.data, defaultAccount.data],
    ...queryDependentFn(async (): Promise<BigNumber> => {
      return await fetchAccountBalance(
        api,
        defaultAccount.data,
        tokenAddress.data!
      );
    }, [tokenAddress, defaultAccount]),
  };
});
