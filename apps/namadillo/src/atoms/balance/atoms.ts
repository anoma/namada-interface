import { SdkEvents } from "@namada/sdk/web";
import { AccountType } from "@namada/types";
import {
  accountsAtom,
  defaultAccountAtom,
  transparentBalanceAtom,
} from "atoms/accounts/atoms";
import {
  chainParametersAtom,
  chainTokensAtom,
  nativeTokenAddressAtom,
} from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { maspIndexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { AddressWithAsset } from "types";
import {
  fetchTokenPrices,
  mapNamadaAddressesToAssets,
  mapNamadaAssetsToTokenBalances,
} from "./functions";
import {
  fetchShieldedBalance,
  shieldedSync,
  ShieldedSyncEmitter,
} from "./services";

export type TokenBalance = AddressWithAsset & {
  amount: BigNumber;
  dollar?: BigNumber;
};

export const viewingKeysAtom = atomWithQuery<[string, string[]]>((get) => {
  const accountsQuery = get(accountsAtom);
  const defaultAccountQuery = get(defaultAccountAtom);

  return {
    queryKey: ["viewing-keys", accountsQuery.data, defaultAccountQuery.data],
    ...queryDependentFn(async () => {
      const shieldedAccounts = accountsQuery.data?.filter(
        (a) => a.type === AccountType.ShieldedKeys
      );
      const defaultShieldedAccount = shieldedAccounts?.find(
        (a) => a.alias === defaultAccountQuery.data?.alias
      );
      const defaultViewingKey = defaultShieldedAccount?.viewingKey ?? "";
      const viewingKeys =
        shieldedAccounts?.map((a) => a.viewingKey ?? "") ?? [];

      return [defaultViewingKey, viewingKeys];
    }, [accountsQuery, defaultAccountQuery]),
  };
});

export const shieldedSyncAtom = atomWithQuery<ShieldedSyncEmitter | null>(
  (get) => {
    const viewingKeysQuery = get(viewingKeysAtom);
    const namTokenAddressQuery = get(nativeTokenAddressAtom);
    const rpcUrl = get(rpcUrlAtom);
    const maspIndexerUrl = get(maspIndexerUrlAtom);

    return {
      queryKey: [
        "shielded-sync",
        viewingKeysQuery.data,
        namTokenAddressQuery.data,
        rpcUrl,
        maspIndexerUrl,
      ],
      ...queryDependentFn(async () => {
        const viewingKeys = viewingKeysQuery.data;
        const namTokenAddress = namTokenAddressQuery.data;
        if (!namTokenAddress || !viewingKeys) {
          return null;
        }
        const [_, allViewingKeys] = viewingKeys;
        return shieldedSync(
          rpcUrl,
          maspIndexerUrl,
          namTokenAddress,
          allViewingKeys
        );
      }, [viewingKeysQuery, namTokenAddressQuery]),
    };
  }
);

export const shieldedBalanceAtom = atomWithQuery<
  { address: string; minDenomAmount: BigNumber }[]
>((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const viewingKeysQuery = get(viewingKeysAtom);
  const chainTokensQuery = get(chainTokensAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const rpcUrl = get(rpcUrlAtom);
  const maspIndexerUrl = get(maspIndexerUrlAtom);
  const shieldedSync = get(shieldedSyncAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: [
      "shielded-balance",
      viewingKeysQuery.data,
      chainTokensQuery.data,
      namTokenAddressQuery.data,
      shieldedSync.data,
      rpcUrl,
      maspIndexerUrl,
    ],
    ...queryDependentFn(async () => {
      const viewingKeys = viewingKeysQuery.data;
      const tokenAddresses = chainTokensQuery.data;
      const syncEmitter = shieldedSync.data;
      if (!viewingKeys || !tokenAddresses || !syncEmitter) {
        return [];
      }
      const [viewingKey] = viewingKeys;

      await new Promise<void>((resolve) => {
        syncEmitter.once(SdkEvents.ProgressBarFinished, () => resolve());
      });

      const response = await fetchShieldedBalance(
        viewingKey,
        tokenAddresses.map((t) => t.address)
      );
      const shieldedBalance = response.map(([address, amount]) => ({
        address,
        minDenomAmount: BigNumber(amount),
      }));
      return shieldedBalance;
    }, [viewingKeysQuery, chainTokensQuery, namTokenAddressQuery]),
  };
});

export const tokenPricesAtom = atomWithQuery((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const transparentBalanceQuery = get(transparentBalanceAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const chainTokensQuery = get(chainTokensAtom);

  // Get the list of addresses that exists on balances
  const obj: Record<string, true> = {};
  shieldedBalanceQuery.data?.forEach(({ address }) => {
    obj[address] = true;
  });
  transparentBalanceQuery.data?.forEach(({ address }) => {
    obj[address] = true;
  });
  const addresses = Object.keys(obj);
  const namAddress = namTokenAddressQuery.data;
  const tokens = chainTokensQuery.data;

  return {
    queryKey: ["token-prices", addresses, tokens, namAddress],
    queryFn: async () => {
      const tokenPrices = await fetchTokenPrices(addresses, tokens ?? []);
      // TODO mock NAM price while it's not available on api
      if (namAddress && !tokenPrices[namAddress]) {
        tokenPrices[namAddress] = new BigNumber(0);
      }
      return tokenPrices;
    },
  };
});

export const namadaShieldedAssetsAtom = atomWithQuery((get) => {
  const shieldedBalances = get(shieldedBalanceAtom);
  const chainTokensQuery = get(chainTokensAtom);
  const chainParameters = get(chainParametersAtom);

  return {
    queryKey: [
      "namada-shielded-assets",
      shieldedBalances.data,
      chainTokensQuery.data,
      chainParameters.data!.chainId,
    ],
    ...queryDependentFn(
      async () =>
        await mapNamadaAddressesToAssets(
          shieldedBalances.data!,
          chainTokensQuery.data!,
          chainParameters.data!.chainId
        ),
      [shieldedBalances, chainTokensQuery, chainParameters]
    ),
  };
});

export const namadaTransparentAssetsAtom = atomWithQuery((get) => {
  const transparentBalances = get(transparentBalanceAtom);
  const chainTokensQuery = get(chainTokensAtom);
  const chainParameters = get(chainParametersAtom);

  return {
    queryKey: [
      "namada-transparent-assets",
      transparentBalances.data,
      chainTokensQuery.data,
      chainParameters.data!.chainId,
    ],
    ...queryDependentFn(
      async () =>
        await mapNamadaAddressesToAssets(
          transparentBalances.data!,
          chainTokensQuery.data!,
          chainParameters.data!.chainId
        ),
      [transparentBalances, chainTokensQuery, chainParameters]
    ),
  };
});

export const shieldedTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const shieldedAssets = get(namadaShieldedAssetsAtom);
  const tokenPrices = get(tokenPricesAtom);

  return {
    queryKey: ["shielded-tokens", shieldedAssets.data, tokenPrices.data],
    ...queryDependentFn(
      () =>
        Promise.resolve(
          mapNamadaAssetsToTokenBalances(
            shieldedAssets.data!,
            tokenPrices.data!
          )
        ),
      [shieldedAssets, tokenPrices]
    ),
  };
});

export const transparentTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const transparentAssets = get(namadaTransparentAssetsAtom);
  const tokenPrices = get(tokenPricesAtom);

  return {
    queryKey: ["transparent-tokens", transparentAssets.data, tokenPrices.data],
    ...queryDependentFn(
      () =>
        Promise.resolve(
          mapNamadaAssetsToTokenBalances(
            transparentAssets.data!,
            tokenPrices.data!
          )
        ),
      [transparentAssets, tokenPrices]
    ),
  };
});
