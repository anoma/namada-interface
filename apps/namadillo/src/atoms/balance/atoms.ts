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
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import * as osmosis from "chain-registry/mainnet/osmosis";
import { atomWithQuery } from "jotai-tanstack-query";
import { AddressWithAsset } from "types";
import {
  findAssetByToken,
  mapNamadaAddressesToAssets,
  mapNamadaAssetsToTokenBalances,
} from "./functions";
import { fetchCoinPrices, fetchShieldedBalance } from "./services";

export type TokenBalance = AddressWithAsset & {
  amount: BigNumber;
  dollar?: BigNumber;
};

const getViewingKeyFromExtension032 = async (): Promise<string | undefined> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const namada: Namada | undefined = (window as any).namada;
    if (namada?.version() === "0.3.2") {
      const accounts = await namada.accounts();
      const defaultAccount = await namada.defaultAccount();
      const shieldedAccount = accounts?.find(
        (a) => a.type === "shielded-keys" && a.alias === defaultAccount?.alias
      );
      return shieldedAccount?.owner;
    }
  } catch {
    // do nothing
  }
  return undefined;
};

export const viewingKeyAtom = atomWithQuery<string>((get) => {
  const accountsQuery = get(accountsAtom);
  const defaultAccountQuery = get(defaultAccountAtom);

  return {
    queryKey: ["viewing-key", accountsQuery.data, defaultAccountQuery.data],
    ...queryDependentFn(async () => {
      const deprecatedViewingKey = await getViewingKeyFromExtension032();
      if (deprecatedViewingKey) {
        return deprecatedViewingKey;
      }
      const shieldedAccount = accountsQuery.data?.find(
        (a) => a.isShielded && a.alias === defaultAccountQuery.data?.alias
      );
      return shieldedAccount?.viewingKey ?? "";
    }, [accountsQuery, defaultAccountQuery]),
  };
});

export const shieldedBalanceAtom = atomWithQuery<
  { address: string; amount: BigNumber }[]
>((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const viewingKeyQuery = get(viewingKeyAtom);
  const tokenAddressesQuery = get(tokenAddressesAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: [
      "shielded-balance",
      viewingKeyQuery.data,
      tokenAddressesQuery.data,
      namTokenAddressQuery.data,
    ],
    ...queryDependentFn(async () => {
      const viewingKey = viewingKeyQuery.data;
      const tokenAddresses = tokenAddressesQuery.data;
      if (!viewingKey || !tokenAddresses) {
        return [];
      }
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
    }, [viewingKeyQuery, tokenAddressesQuery, namTokenAddressQuery]),
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
