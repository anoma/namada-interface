import { Balance, DefaultApi } from "@namada/indexer-client";
import { Account } from "@namada/types";
import { NamadaKeychain } from "hooks/useNamadaKeychain";

export const fetchAccounts = async (): Promise<readonly Account[]> => {
  const namada = await new NamadaKeychain().get();
  const result = await namada?.accounts();
  return result || [];
};

export const fetchDefaultAccount = async (): Promise<Account | undefined> => {
  const namada = await new NamadaKeychain().get();
  return await namada?.defaultAccount();
};

export const fetchAccountBalance = async (
  api: DefaultApi,
  account: Account
): Promise<Balance[]> => {
  return (await api.apiV1AccountAddressGet(account.address)).data;
};
