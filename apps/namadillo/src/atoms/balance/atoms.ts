import { DefaultApi } from "@namada/indexer-client";
import { Account, AccountType, DatedViewingKey } from "@namada/types";
import {
  accountsAtom,
  allDefaultAccountsAtom,
  defaultAccountAtom,
  transparentBalanceAtom,
} from "atoms/accounts/atoms";
import { indexerApiAtom } from "atoms/api";
import {
  chainAssetsMapAtom,
  chainParametersAtom,
  chainTokensAtom,
  nativeTokenAddressAtom,
} from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { tokenPricesFamily } from "atoms/prices/atoms";
import { maspIndexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import { isAxiosError } from "axios";
import BigNumber from "bignumber.js";
import { atom, getDefaultStore } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { atomWithStorage } from "jotai/utils";
import { Address, AddressWithAsset } from "types";
import { namadaAsset, toDisplayAmount } from "utils";
import {
  mapNamadaAddressesToAssets,
  mapNamadaAssetsToTokenBalances,
} from "./functions";
import {
  fetchBlockHeightByTimestamp,
  fetchShieldedBalance,
  fetchShieldRewards,
  shieldedSync,
} from "./services";

export type TokenBalance = AddressWithAsset & {
  amount: BigNumber;
  dollar?: BigNumber;
};

/**
  Gets the viewing key and its birthday timestamp if it's a generated key
 */
const toDatedKeypair = async (
  api: DefaultApi,
  { viewingKey, source, timestamp }: Account
): Promise<DatedViewingKey> => {
  if (typeof viewingKey === "undefined") {
    throw new Error("Viewing key not found");
  }
  if (typeof timestamp === "undefined") {
    throw new Error("Timestamp not found");
  }
  let height = 0;

  if (source === "generated") {
    try {
      height = await fetchBlockHeightByTimestamp(api, timestamp);
    } catch (e) {
      if (isAxiosError(e) && e.status === 404) {
        console.warn(
          "Failed to fetch block height by timestamp, falling back to height 0",
          e
        );
      }
    }
  }

  return {
    key: viewingKey,
    birthday: height,
  };
};

export const viewingKeysAtom = atomWithQuery<
  [DatedViewingKey, DatedViewingKey[]]
>((get) => {
  const accountsQuery = get(accountsAtom);
  const defaultAccountsQuery = get(allDefaultAccountsAtom);
  const api = get(indexerApiAtom);

  return {
    queryKey: ["viewing-keys", accountsQuery.data, defaultAccountsQuery.data],
    ...queryDependentFn(async () => {
      const shieldedAccounts = accountsQuery.data!.filter(
        (a) => a.type === AccountType.ShieldedKeys
      );
      const defaultShieldedAccount = defaultAccountsQuery.data?.find(
        (account) => account.type === AccountType.ShieldedKeys
      );

      if (!defaultShieldedAccount) {
        throw new Error("Default shielded account not found");
      }

      const defaultViewingKey = await toDatedKeypair(
        api,
        defaultShieldedAccount
      );
      const viewingKeys = await Promise.all(
        shieldedAccounts.map(toDatedKeypair.bind(null, api))
      );

      return [defaultViewingKey, viewingKeys];
    }, [accountsQuery, defaultAccountsQuery]),
  };
});

export const storageShieldedBalanceAtom = atomWithStorage<
  Record<Address, { address: Address; minDenomAmount: string }[]>
>("namadillo:shieldedBalance", {});

export const shieldedSyncProgress = atom(0);

export const lastCompletedShieldedSyncAtom = atomWithStorage<
  Record<Address, Date | undefined>
>("namadillo:last-shielded-sync", {});

export const isShieldedSyncCompleteAtom = atom(
  (get) => get(shieldedSyncProgress) === 1
);

export const shieldedBalanceAtom = atomWithQuery((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const viewingKeysQuery = get(viewingKeysAtom);
  const chainTokensQuery = get(chainTokensAtom);
  const chainParametersQuery = get(chainParametersAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const rpcUrl = get(rpcUrlAtom);
  const maspIndexerUrl = get(maspIndexerUrlAtom);
  const defaultAccount = get(defaultAccountAtom);

  const [viewingKey, allViewingKeys] = viewingKeysQuery.data ?? [];
  const chainTokens = chainTokensQuery.data?.map((t) => t.address);
  const chainId = chainParametersQuery.data?.chainId;
  const namTokenAddress = namTokenAddressQuery.data;

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["shield-sync", viewingKey, chainTokens, chainId],
    ...queryDependentFn(async () => {
      if (
        !viewingKey ||
        !allViewingKeys ||
        !chainTokens ||
        !chainId ||
        !namTokenAddress ||
        !rpcUrl
      ) {
        return [];
      }
      const { set, get } = getDefaultStore();

      await shieldedSync({
        rpcUrl,
        maspIndexerUrl,
        token: namTokenAddress,
        viewingKeys: allViewingKeys,
        chainId,
        onProgress: (perc) => set(shieldedSyncProgress, perc),
      });

      const response = await fetchShieldedBalance(
        viewingKey,
        chainTokens,
        chainId
      );

      const shieldedBalance = response.map(([address, amount]) => ({
        address,
        minDenomAmount: amount,
      }));

      const storage = get(storageShieldedBalanceAtom);
      set(storageShieldedBalanceAtom, {
        ...storage,
        [viewingKey.key]: shieldedBalance,
      });

      if (defaultAccount.data) {
        const lastCompleteSyncInfo = get(lastCompletedShieldedSyncAtom);
        // Migration Previously we were storing sync info as a date string,
        // now we store it as a map of transparent accounts
        const syncInfo =
          typeof lastCompleteSyncInfo === "object" ? lastCompleteSyncInfo : {};
        set(lastCompletedShieldedSyncAtom, {
          ...syncInfo,
          [defaultAccount.data.address]: new Date(),
        });
      }

      return shieldedBalance;
    }, [
      viewingKeysQuery,
      chainTokensQuery,
      chainParametersQuery,
      namTokenAddressQuery,
    ]),
  };
});

export const namadaShieldedAssetsAtom = atomWithQuery((get) => {
  const storageShieldedBalance = get(storageShieldedBalanceAtom);
  const viewingKeysQuery = get(viewingKeysAtom);
  const chainAssetsMap = get(chainAssetsMapAtom);

  const [viewingKey] = viewingKeysQuery.data ?? [];
  const shieldedBalance = viewingKey && storageShieldedBalance[viewingKey.key];

  return {
    queryKey: ["namada-shielded-assets", shieldedBalance],
    ...queryDependentFn(
      async () =>
        mapNamadaAddressesToAssets(
          shieldedBalance?.map((i) => ({ ...i, tokenAddress: i.address })) ??
            [],
          chainAssetsMap
        ),
      [viewingKeysQuery]
    ),
  };
});

export const namadaTransparentAssetsAtom = atomWithQuery((get) => {
  const transparentBalances = get(transparentBalanceAtom);
  const chainAssetsMap = get(chainAssetsMapAtom);

  const transparentBalance = transparentBalances.data;

  return {
    queryKey: ["namada-transparent-assets", transparentBalance, chainAssetsMap],
    ...queryDependentFn(
      async () =>
        mapNamadaAddressesToAssets(transparentBalance ?? [], chainAssetsMap),
      [transparentBalances]
    ),
  };
});

export const shieldedTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const shieldedAssets = get(namadaShieldedAssetsAtom);
  const tokenPrices = get(
    tokenPricesFamily(
      Object.values(shieldedAssets.data ?? {}).map((i) => i.originalAddress)
    )
  );

  return {
    queryKey: ["shielded-tokens", shieldedAssets.data, tokenPrices.data],
    ...queryDependentFn(
      async () =>
        mapNamadaAssetsToTokenBalances(
          shieldedAssets.data ?? {},
          tokenPrices.data ?? {}
        ),
      [shieldedAssets, tokenPrices]
    ),
  };
});

export const transparentTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const transparentAssets = get(namadaTransparentAssetsAtom);
  const tokenPrices = get(
    tokenPricesFamily(
      Object.values(transparentAssets.data ?? {}).map((i) => i.originalAddress)
    )
  );

  return {
    queryKey: ["transparent-tokens", transparentAssets.data, tokenPrices.data],
    ...queryDependentFn(
      () =>
        Promise.resolve(
          mapNamadaAssetsToTokenBalances(
            transparentAssets.data ?? {},
            tokenPrices.data ?? {}
          )
        ),
      [transparentAssets, tokenPrices]
    ),
  };
});

export const storageShieldedRewardsAtom = atomWithStorage<
  Record<Address, { minDenomAmount: string }>
>("namadillo:shieldedRewards", {});

export const shieldRewardsAtom = atomWithQuery((get) => {
  const viewingKeysQuery = get(viewingKeysAtom);
  const chainParametersQuery = get(chainParametersAtom);
  const { set } = getDefaultStore();

  return {
    queryKey: ["shield-rewards", viewingKeysQuery.data],
    ...queryDependentFn(async () => {
      const [viewingKey] = viewingKeysQuery.data!;
      const { chainId } = chainParametersQuery.data!;
      const minDenomAmount = BigNumber(
        await fetchShieldRewards(viewingKey, chainId)
      );

      const storage = get(storageShieldedRewardsAtom);
      set(storageShieldedRewardsAtom, {
        ...storage,
        [viewingKey.key]: { minDenomAmount: minDenomAmount.toString() },
      });

      return { minDenomAmount };
    }, [viewingKeysQuery, chainParametersQuery]),
  };
});

export const cachedShieldedRewardsAtom = atom((get) => {
  const viewingKeysQuery = get(viewingKeysAtom);
  const storage = get(storageShieldedRewardsAtom);

  if (!viewingKeysQuery.data || !storage) {
    return { amount: BigNumber(0) };
  }
  const [viewingKey] = viewingKeysQuery.data;

  const rewards = get(shieldRewardsAtom);
  const data = rewards.isSuccess ? rewards.data : storage[viewingKey.key];

  if (!data) {
    return { amount: BigNumber(0) };
  }

  return {
    amount: toDisplayAmount(namadaAsset(), BigNumber(data.minDenomAmount)),
  };
});
