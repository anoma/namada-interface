import { getIntegration } from "@namada/integrations";
import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import { getSdkInstance } from "hooks";

export const fetchAccounts = async (): Promise<readonly Account[]> => {
  const namada = getIntegration("namada");
  const result = await namada.accounts();
  if (typeof result === "undefined") {
    throw new Error("Integration error: accounts object is undefined");
  }
  return result;
};

export const fetchDefaultAccount = async (): Promise<Account | undefined> => {
  const namada = getIntegration("namada");
  const result = await namada.defaultAccount();
  if (typeof result === "undefined") {
    throw new Error("Integration error: account object is undefined");
  }
  return result;
};

export const fetchAccountBalance = async (
  account: Account | undefined,
  tokenAddress: string
): Promise<BigNumber> => {
  if (!account) return BigNumber(0);
  const { rpc } = await getSdkInstance();
  const balances = (
    await rpc.queryBalance(account.address, [tokenAddress])
  ).map(([token, amount]) => {
    return {
      token,
      amount,
    };
  });
  return new BigNumber(balances[0].amount || 0);
};

export const filterTransparentAccount = (
  accounts: readonly Account[] | undefined
): readonly Account[] => {
  if (!accounts) return [];
  return accounts.filter((account: Account) => account.isShielded);
};
