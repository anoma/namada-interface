import { getIntegration } from "@namada/integrations";
import { Account } from "@namada/types";
import { indexerApiAtom } from "atoms/api";
import { nativeTokenAddressAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { AssetWithBalance } from "atoms/integrations/services";
import { namadaExtensionConnectedAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atomWithMutation, atomWithQuery } from "jotai-tanstack-query";
import { chainConfigByName } from "registry";
import {
  fetchAccountBalances,
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
        if (!accounts.data[i].isShielded) {
          break;
        }
        defaultAccounts.push(accounts.data[i]);
      }

      return defaultAccounts;
    }, [accounts, defaultAccount]),
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

export const accountBalancesAtom = atomWithQuery<{
  [token: string]: BigNumber | undefined;
}>((get) => {
  const defaultAccount = get(defaultAccountAtom);
  const enablePolling = get(shouldUpdateBalanceAtom);
  const api = get(indexerApiAtom);

  return {
    // TODO: subscribe to indexer events when it's done
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["balances", defaultAccount.data],
    ...queryDependentFn(async () => {
      return await fetchAccountBalances(api, defaultAccount.data);
    }, [defaultAccount]),
  };
});

export const accountNamBalanceAtom = atomWithQuery<BigNumber>((get) => {
  const tokenAddress = get(nativeTokenAddressAtom);
  const enablePolling = get(shouldUpdateBalanceAtom);
  const chainConfig = chainConfigByName("namada");
  const accountBalances = get(accountBalancesAtom);

  return {
    // TODO: subscribe to indexer events when it's done
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["nam-balance", tokenAddress.data],
    ...queryDependentFn(async (): Promise<BigNumber> => {
      const namBalance = accountBalances.data![tokenAddress.data!];

      if (typeof namBalance === "undefined") {
        throw new Error("no NAM balance found");
      }

      // As this is a nam balance specific atom, we can safely assume that the
      // first currency is the native token
      const decimals = chainConfig.currencies[0].coinDecimals;

      return namBalance.shiftedBy(-decimals);
    }, [tokenAddress, accountBalances]),
  };
});

export const accountAssetsAtom = atomWithQuery<{
  [token: string]: AssetWithBalance;
}>((get) => {
  const balances = get(accountBalancesAtom);

  return {
    queryKey: ["account-assets", balances.data],
    ...queryDependentFn(async () => {
      const balanceEntries = Object.entries(balances.data!);

      const assetEntries = balanceEntries.map(([token, balance]) => {
        const asset = {
          denom_units: [
            {
              denom: token,
              exponent: 0,
            },
          ],
          base: token,
          name: token,
          display: token,
          symbol: token,
        };

        return [token, { asset, balance }];
      });

      return Object.fromEntries(assetEntries);
    }, [balances]),
  };
});
