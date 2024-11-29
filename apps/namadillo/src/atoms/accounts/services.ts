import { Balance, DefaultApi } from "@namada/indexer-client";
import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import { NamadaKeychain } from "hooks/useNamadaKeychain";
import { namadaAsset, toDisplayAmount } from "utils";

export const fetchAccounts = async (): Promise<readonly Account[]> => {
  const namada = await new NamadaKeychain().get();
  const result = await namada.accounts();
  return result || [];
};

export const fetchDefaultAccount = async (): Promise<Account | undefined> => {
  const namada = await new NamadaKeychain().get();
  return await namada.defaultAccount();
};

export const fetchNamAccountBalance = async (
  api: DefaultApi,
  account: Account | undefined,
  tokenAddress: string
): Promise<BigNumber> => {
  if (!account) return BigNumber(0);
  const balancesResponse = await api.apiV1AccountAddressGet(account.address);

  const balance = balancesResponse.data
    .filter(({ tokenAddress: ta }) => ta === tokenAddress)
    .map(({ tokenAddress, minDenomAmount }) => {
      return {
        token: tokenAddress,
        amount: toDisplayAmount(namadaAsset(), new BigNumber(minDenomAmount)),
      };
    })
    .at(0);

  return balance ? BigNumber(balance.amount) : BigNumber(0);
};

export const fetchAccountBalance = async (
  api: DefaultApi,
  account: Account | undefined
): Promise<Balance[]> => {
  if (!account) return [];
  const balancesResponse = await api.apiV1AccountAddressGet(account.address);
  return balancesResponse.data;
};
