import { SdkEvents } from "@namada/sdk/web";
import { Namada } from "@namada/types";
import {
  accountsAtom,
  defaultAccountAtom,
  transparentBalanceAtom,
} from "atoms/accounts/atoms";
import {
  chainParametersAtom,
  nativeTokenAddressAtom,
  tokenAddressesAtom,
} from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { maspIndexerUrlAtom, rpcUrlAtom } from "atoms/settings";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import * as osmosis from "chain-registry/mainnet/osmosis";
import { atomWithQuery } from "jotai-tanstack-query";
import semver from "semver";
import { AddressWithAsset } from "types";
import {
  findAssetByToken,
  mapNamadaAddressesToAssets,
  mapNamadaAssetsToTokenBalances,
} from "./functions";
import {
  fetchCoinPrices,
  fetchShieldedBalance,
  shieldedSync,
  ShieldedSyncEmitter,
} from "./services";

export type TokenBalance = AddressWithAsset & {
  amount: BigNumber;
  dollar?: BigNumber;
};

const DEPRECATED_getViewingKey = async (): Promise<
  [string, string[]] | undefined
> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const namada: Namada | undefined = (window as any).namada;
    if (namada && semver.lt(namada.version(), "0.3.3")) {
      const accounts = await namada.accounts();
      const defaultAccount = await namada.defaultAccount();
      const shieldedAccounts = accounts?.filter(
        (a) => a.type === "shielded-keys"
      );
      const defaultShieldedAccount = shieldedAccounts?.find(
        (a) => a.alias === defaultAccount?.alias
      );
      const defaultViewingKey = defaultShieldedAccount?.owner ?? "";
      const viewingKeys = shieldedAccounts?.map((a) => a.owner ?? "") ?? [];

      return [defaultViewingKey, viewingKeys];
    }
  } catch {
    // do nothing
  }
  return undefined;
};

export const viewingKeysAtom = atomWithQuery<[string, string[]]>((get) => {
  const accountsQuery = get(accountsAtom);
  const defaultAccountQuery = get(defaultAccountAtom);

  return {
    queryKey: ["viewing-keys", accountsQuery.data, defaultAccountQuery.data],
    ...queryDependentFn(async () => {
      const deprecatedViewingKey = await DEPRECATED_getViewingKey();
      if (deprecatedViewingKey) {
        return deprecatedViewingKey;
      }
      const shieldedAccounts = accountsQuery.data?.filter((a) => a.isShielded);
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
  { address: string; amount: BigNumber }[]
>((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const viewingKeysQuery = get(viewingKeysAtom);
  const tokenAddressesQuery = get(tokenAddressesAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const rpcUrl = get(rpcUrlAtom);
  const maspIndexerUrl = get(maspIndexerUrlAtom);
  const shieldedSync = get(shieldedSyncAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: [
      "shielded-balance",
      viewingKeysQuery.data,
      tokenAddressesQuery.data,
      namTokenAddressQuery.data,
      shieldedSync.data,
      rpcUrl,
      maspIndexerUrl,
    ],
    ...queryDependentFn(async () => {
      const viewingKeys = viewingKeysQuery.data;
      const tokenAddresses = tokenAddressesQuery.data;
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
        amount:
          // Sdk returns the nam amount as `nam` instead of `namnam`
          namTokenAddressQuery.data === address ?
            new BigNumber(amount).shiftedBy(6)
          : new BigNumber(amount),
      }));
      return shieldedBalance;
    }, [viewingKeysQuery, tokenAddressesQuery, namTokenAddressQuery]),
  };
});

export const tokenPricesAtom = atomWithQuery((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const transparentBalanceQuery = get(transparentBalanceAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const tokenAddressesQuery = get(tokenAddressesAtom);

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
  const tokens = tokenAddressesQuery.data;

  return {
    queryKey: ["token-prices", addresses, tokens, namAddress],
    queryFn: async () => {
      const baseMap: Record<string, string> = {};
      addresses.forEach((address) => {
        const token = tokens?.find((t) => t.address === address);
        if (token) {
          const asset = findAssetByToken(token, osmosis.assets);
          if (asset) {
            baseMap[asset.base] = address;
          }
        }
      });
      const baseList = Object.keys(baseMap);
      const apiResponse = await fetchCoinPrices(baseList);

      const tokenPrices: Record<string, BigNumber> = {};
      Object.entries(apiResponse).forEach(([base, value]) => {
        const address = baseMap[base];
        const dollar = Object.values(value)[0];
        if (dollar) {
          tokenPrices[address] = new BigNumber(dollar);
        }
      });
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
  const tokenAddresses = get(tokenAddressesAtom);
  const chainParameters = get(chainParametersAtom);

  return {
    queryKey: [
      "namada-shielded-assets",
      shieldedBalances.data,
      tokenAddresses.data,
      chainParameters.data!.chainId,
    ],
    ...queryDependentFn(
      async () =>
        await mapNamadaAddressesToAssets(
          shieldedBalances.data!,
          tokenAddresses.data!,
          chainParameters.data!.chainId
        ),
      [shieldedBalances, tokenAddresses, chainParameters]
    ),
  };
});

export const namadaTransparentAssetsAtom = atomWithQuery((get) => {
  const transparentBalances = get(transparentBalanceAtom);
  const tokenAddresses = get(tokenAddressesAtom);
  const chainParameters = get(chainParametersAtom);

  return {
    queryKey: [
      "namada-transparent-assets",
      transparentBalances.data,
      tokenAddresses.data,
      chainParameters.data!.chainId,
    ],
    ...queryDependentFn(
      async () =>
        await mapNamadaAddressesToAssets(
          transparentBalances.data!,
          tokenAddresses.data!,
          chainParameters.data!.chainId
        ),
      [transparentBalances, tokenAddresses, chainParameters]
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
