import { DefaultApi } from "@namada/indexer-client";
import { SdkEvents } from "@namada/sdk/web";
import { Account, AccountType, DatedViewingKey } from "@namada/types";
import {
  accountsAtom,
  defaultAccountAtom,
  transparentBalanceAtom,
} from "atoms/accounts/atoms";
import { indexerApiAtom } from "atoms/api";
import {
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
import { atomWithQuery } from "jotai-tanstack-query";
import { AddressWithAsset } from "types";
import {
  mapNamadaAddressesToAssets,
  mapNamadaAssetsToTokenBalances,
} from "./functions";
import {
  fetchBlockHeightByTimestamp,
  fetchShieldedBalance,
  shieldedSync,
  ShieldedSyncEmitter,
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
  const defaultAccountQuery = get(defaultAccountAtom);
  const api = get(indexerApiAtom);

  return {
    queryKey: ["viewing-keys", accountsQuery.data, defaultAccountQuery.data],
    ...queryDependentFn(async () => {
      const shieldedAccounts = accountsQuery.data!.filter(
        (a) => a.type === AccountType.ShieldedKeys
      );
      const defaultShieldedAccount = shieldedAccounts.find(
        (a) => a.alias === defaultAccountQuery.data?.alias
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
    }, [accountsQuery, defaultAccountQuery]),
  };
});

export const shieldedSyncAtom = atomWithQuery<ShieldedSyncEmitter | null>(
  (get) => {
    const viewingKeysQuery = get(viewingKeysAtom);
    const namTokenAddressQuery = get(nativeTokenAddressAtom);
    const rpcUrl = get(rpcUrlAtom);
    const maspIndexerUrl = get(maspIndexerUrlAtom);
    const parametersQuery = get(chainParametersAtom);

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
        const parameters = parametersQuery.data;
        if (!namTokenAddress || !viewingKeys || !parameters) {
          return null;
        }
        const [_, allViewingKeys] = viewingKeys;
        return shieldedSync(
          rpcUrl,
          maspIndexerUrl,
          namTokenAddress,
          allViewingKeys,
          parameters.chainId
        );
      }, [viewingKeysQuery, namTokenAddressQuery, parametersQuery]),
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
  const chainParametersQuery = get(chainParametersAtom);

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
      const chainTokens = chainTokensQuery.data;
      const syncEmitter = shieldedSync.data;
      const chain = chainParametersQuery.data;
      if (!viewingKeys || !chainTokens || !syncEmitter || !chain) {
        return [];
      }
      const [viewingKey] = viewingKeys;

      await new Promise<void>((resolve) => {
        syncEmitter.once(SdkEvents.ProgressBarFinished, () => resolve());
      });

      const response = await fetchShieldedBalance(
        viewingKey,
        chainTokens.map((t) => t.address),
        chain.chainId
      );
      const shieldedBalance = response.map(([address, amount]) => ({
        address,
        minDenomAmount: BigNumber(amount),
      }));
      return shieldedBalance;
    }, [
      viewingKeysQuery,
      chainTokensQuery,
      namTokenAddressQuery,
      chainParametersQuery,
    ]),
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
  const tokenPrices = get(
    tokenPricesFamily(
      Object.values(shieldedAssets.data ?? {}).map((i) => i.originalAddress)
    )
  );

  return {
    queryKey: ["shielded-tokens", shieldedAssets.data, tokenPrices.data],
    ...queryDependentFn(
      () =>
        Promise.resolve(
          mapNamadaAssetsToTokenBalances(
            shieldedAssets.data ?? {},
            tokenPrices.data ?? {}
          )
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
