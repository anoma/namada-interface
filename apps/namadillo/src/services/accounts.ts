import { Balance, DefaultApi } from "@namada/indexer-client";
import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import {
  getDefaultTransparentAccount,
  getKeychainAccounts,
} from "lib/accounts";
import { getNamTokenAmount } from "lib/tokens";

export const fetchAccounts = async (): Promise<readonly Account[]> => {
  return await getKeychainAccounts();
};

export const fetchDefaultAccount = async (): Promise<Account | undefined> => {
  return await getDefaultTransparentAccount();
};

export const fetchNamAccountBalance = async (
  api: DefaultApi,
  account: Account | undefined,
  tokenAddress: string
): Promise<BigNumber> => {
  if (!account) return BigNumber(0);
  const balancesResponse = await api.apiV1AccountAddressGet(account.address);
  return getNamTokenAmount(balancesResponse.data, tokenAddress);
};

export const fetchAccountBalance = async (
  api: DefaultApi,
  account: Account | undefined
): Promise<Balance[]> => {
  if (!account) return [];
  const balancesResponse = await api.apiV1AccountAddressGet(account.address);
  return balancesResponse.data;
};
