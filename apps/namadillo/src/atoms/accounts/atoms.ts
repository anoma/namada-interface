import { getIntegration } from "@namada/integrations";
import { Account } from "@namada/types";
import { indexerApiAtom } from "atoms/api";
import { nativeTokenAddressAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import {
  namadaExtensionConnectedAtom,
  namadaExtensionConnectionStatus,
} from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
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
  const extensionStatus = get(namadaExtensionConnectionStatus);
  return {
    enabled: extensionStatus !== "connecting",
    queryKey: ["default-account", extensionStatus],
    queryFn: fetchDefaultAccount,
  };
});

export const updateDefaultAccountAtom = atomWithMutation(() => {
  const integration = getIntegration("namada");
  return {
    mutationFn: (address: string) => integration.updateDefaultAccount(address),
  };
});

export const disconnectAccountAtom = atomWithMutation(() => {
  const integration = getIntegration("namada");
  return {
    mutationFn: () => integration.disconnect(),
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
