import { Asset } from "@chain-registry/types";
import { Balance } from "@heliaxdev/namada-sdk/web";
import {
  accountsAtom,
  defaultAccountAtom,
  transparentBalanceAtom,
} from "atoms/accounts/atoms";
import { nativeTokenAddressAtom, tokenAddressesAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { availableAssetsAtom } from "atoms/integrations";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { atomWithQuery } from "jotai-tanstack-query";
import { namadaAsset } from "registry/namadaAsset";
import { unknownAsset } from "registry/unknownAsset";
import { toDisplayAmount } from "utils";
import { getSdkInstance } from "utils/sdk";
import { findAssetByToken } from "./functions";
import { fetchCoinPrices } from "./services";

export type TokenBalance = {
  asset: Asset;
  balance: BigNumber;
  dollar?: BigNumber;
};

export const viewingKeyAtom = atomWithQuery<string>((get) => {
  const accountsQuery = get(accountsAtom);
  const defaultAccountQuery = get(defaultAccountAtom);

  return {
    queryKey: ["viewing-key", accountsQuery.data, defaultAccountQuery.data],
    ...queryDependentFn(async () => {
      const shieldedAccount = accountsQuery.data?.find(
        (a) => a.isShielded && a.alias === defaultAccountQuery.data?.alias
      );
      return shieldedAccount?.viewingKey ?? "";
    }, [accountsQuery, defaultAccountQuery]),
  };
});

export const shieldedBalanceAtom = atomWithQuery<Balance>((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const viewingKeyQuery = get(viewingKeyAtom);
  const tokenAddressesQuery = get(tokenAddressesAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: [
      "shielded-balance",
      viewingKeyQuery.data,
      tokenAddressesQuery.data,
    ],
    ...queryDependentFn(async () => {
      const viewingKey = viewingKeyQuery.data;
      const tokenAddresses = tokenAddressesQuery.data;
      if (!viewingKey || !tokenAddresses) {
        return [];
      }
      // TODO mock shielded balance
      // await new Promise((r) => setTimeout(() => r(0), 500));
      // getSdkInstance().then((sdk) => sdk.rpc.shieldedSync([viewingKey]));
      // return [
      //   ["tnam1qy440ynh9fwrx8aewjvvmu38zxqgukgc259fzp6h", "37"], // nam
      //   ["tnam1p5nnjnasjtfwen2kzg78fumwfs0eycqpecuc2jwz", "1"], // uatom
      // ];
      const sdk = await getSdkInstance();
      await sdk.rpc.shieldedSync([viewingKey]);
      return await sdk.rpc.queryBalance(
        viewingKey,
        tokenAddresses.map((t) => t.address)
      );
    }, [viewingKeyQuery, tokenAddressesQuery]),
  };
});

export const assetByAddressAtom = atomWithQuery((get) => {
  const tokenAddressesQuery = get(tokenAddressesAtom);
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const availableAssets = get(availableAssetsAtom);

  return {
    queryKey: [
      "asset-by-address",
      tokenAddressesQuery.data,
      namTokenAddressQuery.data,
    ],
    queryFn: () => {
      const assetByAddress: Record<string, Asset> = {};
      if (namTokenAddressQuery.data) {
        assetByAddress[namTokenAddressQuery.data] = namadaAsset;
      }
      tokenAddressesQuery.data?.forEach((token) => {
        const asset = findAssetByToken(token, availableAssets);
        if (asset) {
          assetByAddress[token.address] = asset;
        }
      });
      return assetByAddress;
    },
  };
});

export const tokenPricesAtom = atomWithQuery((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const transparentBalanceQuery = get(transparentBalanceAtom);
  const assetByAddressQuery = get(assetByAddressAtom);

  // Get the list of addresses that exists on balances
  const obj: Record<string, true> = {};
  shieldedBalanceQuery.data?.forEach(([address]) => {
    obj[address] = true;
  });
  transparentBalanceQuery.data?.forEach(({ tokenAddress }) => {
    obj[tokenAddress] = true;
  });
  const addresses = Object.keys(obj);

  return {
    queryKey: ["token-price", addresses, assetByAddressQuery.data],
    queryFn: async () => {
      const addressByBase: Record<string, string> = {};
      addresses.forEach((address) => {
        const base = assetByAddressQuery.data?.[address]?.base;
        if (base) {
          addressByBase[base] = address;
        }
      });
      const apiResponse = await fetchCoinPrices(Object.keys(addressByBase));
      // TODO mock NAM price
      // apiResponse[namadaAsset.base] = {
      //   "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4":
      //     "1.000000000000000000000000000000000000",
      // };
      const tokenPrices: Record<string, BigNumber> = {};
      Object.entries(apiResponse).forEach(([base, value]) => {
        const address = addressByBase[base];
        tokenPrices[address] = new BigNumber(Object.values(value)[0]);
      });
      return tokenPrices;
    },
  };
});

export const shieldedTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const shieldedBalanceQuery = get(shieldedBalanceAtom);
  const assetByAddressQuery = get(assetByAddressAtom);
  const tokenPricesQuery = get(tokenPricesAtom);

  return {
    queryKey: [
      "shielded-tokens",
      shieldedBalanceQuery.data,
      assetByAddressQuery.data,
      tokenPricesQuery.data,
    ],
    ...queryDependentFn(
      async () =>
        shieldedBalanceQuery.data?.map(([address, amount]) =>
          formatTokenBalance(
            address,
            amount,
            assetByAddressQuery.data,
            tokenPricesQuery.data
          )
        ) ?? [],
      [shieldedBalanceQuery, tokenPricesQuery, assetByAddressQuery]
    ),
  };
});

export const transparentTokensAtom = atomWithQuery<TokenBalance[]>((get) => {
  const transparentBalanceQuery = get(transparentBalanceAtom);
  const assetByAddressQuery = get(assetByAddressAtom);
  const tokenPricesQuery = get(tokenPricesAtom);

  return {
    queryKey: [
      "transparent-tokens",
      transparentBalanceQuery.data,
      assetByAddressQuery.data,
      tokenPricesQuery.data,
    ],
    ...queryDependentFn(
      async () =>
        transparentBalanceQuery.data?.map(({ tokenAddress, balance }) =>
          formatTokenBalance(
            tokenAddress,
            balance,
            assetByAddressQuery.data,
            tokenPricesQuery.data
          )
        ) ?? [],
      [transparentBalanceQuery, tokenPricesQuery, assetByAddressQuery]
    ),
  };
});

const formatTokenBalance = (
  address: string,
  amount: string,
  assetsByAddress?: Record<string, Asset>,
  tokenPrices?: Record<string, BigNumber>
): TokenBalance => {
  const asset = assetsByAddress?.[address] ?? unknownAsset;
  const balance = toDisplayAmount(asset, new BigNumber(amount));

  const tokenPrice = tokenPrices?.[address];
  const dollar = tokenPrice ? balance.multipliedBy(tokenPrice) : undefined;

  return {
    asset,
    balance,
    dollar,
  };
};
