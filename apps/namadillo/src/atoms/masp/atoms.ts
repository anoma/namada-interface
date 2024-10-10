import { Balance } from "@heliax/namada-sdk/web";
import { accountsAtom, defaultAccountAtom } from "atoms/accounts/atoms";
import { nativeTokenAddressAtom } from "atoms/chain";
import { shouldUpdateBalanceAtom } from "atoms/etc";
import { queryDependentFn } from "atoms/utils";
import BigNumber from "bignumber.js";
import { getSdkInstance } from "hooks/useSdk";
import { atomWithQuery } from "jotai-tanstack-query";

export const viewingKeyAtom = atomWithQuery<string | undefined>((get) => {
  const accountsQuery = get(accountsAtom);
  const defaultAccountQuery = get(defaultAccountAtom);

  return {
    queryKey: ["viewing-key"],
    ...queryDependentFn(async () => {
      const shieldedAccount = accountsQuery.data?.find(
        (a) => a.isShielded && a.alias === defaultAccountQuery.data?.alias
      );
      return shieldedAccount?.viewingKey;
    }, [accountsQuery, defaultAccountQuery]),
  };
});

export const shieldedBalanceAtom = atomWithQuery<Balance>((get) => {
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const viewingKeyQuery = get(viewingKeyAtom);

  return {
    queryKey: ["shielded-balance", viewingKeyQuery.data],
    ...queryDependentFn(async () => {
      const viewingKey = viewingKeyQuery.data;
      const namTokenAddress = namTokenAddressQuery.data;
      if (!viewingKey || !namTokenAddress) {
        return [];
      }
      const sdk = await getSdkInstance();
      await sdk.rpc.shieldedSync([viewingKey]);
      return await sdk.rpc.queryBalance(viewingKey, [
        // TODO add all token addresses that could be shielded
        namTokenAddress,
      ]);
    }, [namTokenAddressQuery, viewingKeyQuery]),
  };
});

export const totalShieldedBalanceAtom = atomWithQuery<BigNumber>((get) => {
  const enablePolling = get(shouldUpdateBalanceAtom);
  const shieldedBalanceQuery = get(shieldedBalanceAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["total-shielded-balance"],
    ...queryDependentFn(async () => {
      if (!shieldedBalanceQuery.data) {
        return new BigNumber(0);
      }
      // TODO convert to fiat values
      return BigNumber.sum(...shieldedBalanceQuery.data.map((b) => b[1]));
    }, [shieldedBalanceQuery]),
  };
});

export const namShieldedBalanceAtom = atomWithQuery<BigNumber>((get) => {
  const namTokenAddressQuery = get(nativeTokenAddressAtom);
  const enablePolling = get(shouldUpdateBalanceAtom);
  const shieldedBalanceQuery = get(shieldedBalanceAtom);

  return {
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["nam-shielded-balance"],
    ...queryDependentFn(async () => {
      const namTokenAddress = namTokenAddressQuery.data;
      if (!shieldedBalanceQuery.data || !namTokenAddress) {
        return new BigNumber(0);
      }
      return BigNumber.sum(
        ...shieldedBalanceQuery.data
          .filter((b) => b[0] === namTokenAddress)
          .map((b) => b[1])
      );
    }, [shieldedBalanceQuery]),
  };
});
