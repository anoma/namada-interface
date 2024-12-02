import { Account, AccountType } from "@namada/types";
import { indexerApiAtom } from "atoms/api";
import { nativeTokenAddressAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { NamadaKeychain } from "hooks/useNamadaKeychain";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import {
  fetchAccountBalance,
  fetchAccounts,
  fetchDefaultAccount,
  fetchNamAccountBalance,
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

export const allDefaultAccountsAtom = atomWithQuery<Account[]>((get) => {
  const defaultAccount = get(defaultAccountAtom);
  const accounts = get(accountsAtom);
  return {
    queryKey: ["all-default-accounts", accounts.data, defaultAccount.data],
    ...queryDependentFn(async () => {
      if (!accounts.data) {
        return [];
      }

      const transparentAccountIdx = accounts.data.findIndex(
        (account) => account.address === defaultAccount.data?.address
      );

      // namada.accounts() returns a plain array of accounts, composed by the transparent
      // account followed by its shielded accounts.
      if (transparentAccountIdx === -1) {
        return [];
      }

      const defaultAccounts = [accounts.data[transparentAccountIdx]];
      for (let i = transparentAccountIdx + 1; i < accounts.data.length; i++) {
        if (accounts.data[i].type !== AccountType.ShieldedKeys) {
          break;
        }
        defaultAccounts.push(accounts.data[i]);
      }

      return defaultAccounts;
    }, [accounts, defaultAccount]),
  };
});

export const updateDefaultAccountAtom = atomWithMutation(() => {
  const namadaPromise = new NamadaKeychain().get();
  return {
    mutationFn: (address: string) =>
      namadaPromise.then((injectedNamada) =>
        injectedNamada.updateDefaultAccount(address)
      ),
  };
});

export const disconnectAccountAtom = atomWithMutation(() => {
  const namadaPromise = new NamadaKeychain().get();
  return {
    mutationFn: () =>
      namadaPromise.then((injectedNamada) => injectedNamada.disconnect()),
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
      return await fetchNamAccountBalance(
        api,
        defaultAccount.data,
        tokenAddress.data!
      );
    }, [tokenAddress, defaultAccount]),
  };
});

// TODO combine the `accountBalanceAtom` with the `transparentBalanceAtom`
// Then execute only once the `fetchAccountBalance`, deleting the `fetchNamAccountBalance`
export const transparentBalanceAtom = atomWithQuery<
  { address: string; minDenomAmount: BigNumber }[]
>((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const api = get(indexerApiAtom);
  const defaultAccountQuery = get(defaultAccountAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["transparent-balance", defaultAccountQuery.data],
    ...queryDependentFn(async () => {
      const response = await fetchAccountBalance(api, defaultAccountQuery.data);
      return response.map((item) => ({
        address: item.tokenAddress,
        minDenomAmount: BigNumber(item.minDenomAmount),
      }));
    }, [defaultAccountQuery]),
  };
});
