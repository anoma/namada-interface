import { Balance, DefaultApi } from "@namada/indexer-client";
import { getIntegration } from "@namada/integrations";
import { Account } from "@namada/types";
import BigNumber from "bignumber.js";

export const fetchAccounts = async (): Promise<readonly Account[]> => {
  const namada = getIntegration("namada");
  const result = await namada.accounts();
  return result || [];
};

export const fetchDefaultAccount = async (): Promise<Account | undefined> => {
  const namada = getIntegration("namada");
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
    .map(({ tokenAddress, balance }) => {
      return {
        token: tokenAddress,
        amount: balance,
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
