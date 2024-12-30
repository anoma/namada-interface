import {
  Account,
  AccountType,
  GenDisposableSignerResponse,
} from "@namada/types";
import { NamadaKeychain } from "hooks/useNamadaKeychain";

export const getDefaultTransparentAccount = async (): Promise<
  Account | undefined
> => {
  const namada = await new NamadaKeychain().get();
  return await namada?.defaultAccount();
};

export const getDisposableKeypair = async (): Promise<
  GenDisposableSignerResponse | never
> => {
  const namada = await new NamadaKeychain().get();
  const response = await namada?.genDisposableKeypair();
  if (!response) {
    throw new Error("Failed to generate disposable signer");
  }
  return response;
};

// TODO: ?? should it be approved accounts here?
export const getKeychainAccounts = async (): Promise<readonly Account[]> => {
  const namada = await new NamadaKeychain().get();
  const result = await namada?.accounts();
  return result || [];
};

export const findAccountByAlias = (
  accounts: Account[],
  alias: string | undefined
): Account | undefined => accounts.find((a) => a.alias === alias);

export const filterShieldedAccounts = (
  accounts: readonly Account[]
): Account[] => accounts.filter((a) => a.type === AccountType.ShieldedKeys);
