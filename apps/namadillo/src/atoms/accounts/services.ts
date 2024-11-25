import { Balance, DefaultApi } from "@namada/indexer-client";
import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import { NamadaKeychain } from "hooks/useNamadaKeychain";

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
  tokenAddress: string,
  decimals: number
): Promise<BigNumber> => {
  if (!account) return BigNumber(0);
  const balancesResponse = await api.apiV1AccountAddressGet(account.address);

  const balance = balancesResponse.data
    // TODO: add filter to the api call
    .filter(({ tokenAddress: ta }) => ta === tokenAddress)
    .map(({ tokenAddress, balance }) => {
      return {
        token: tokenAddress,
        amount: balance,
      };
    })
    .at(0);

  return balance ?
      BigNumber(balance.amount).shiftedBy(-decimals)
    : BigNumber(0);
};

export const fetchAccountBalance = async (
  api: DefaultApi,
  account: Account | undefined
): Promise<Balance[]> => {
  if (!account) return [];
  const balancesResponse = await api.apiV1AccountAddressGet(account.address);
  return balancesResponse.data;
};
