import { getIntegration } from "@namada/integrations";
import { Account } from "@namada/types";
import BigNumber from "bignumber.js";
import { getSdkInstance } from "hooks";

export const fetchAccounts = async (): Promise<readonly Account[]> => {
  const namada = getIntegration("namada");
  const result = await namada.accounts();
  return result || [];
};

export const fetchDefaultAccount = async (): Promise<Account | undefined> => {
  const namada = getIntegration("namada");
  return await namada.defaultAccount();
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
