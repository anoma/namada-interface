import { DefaultApi } from "@anomaorg/namada-indexer-client";
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

export const fetchAccountBalances = async (
  api: DefaultApi,
  account: Account | undefined
): Promise<{ [token: string]: BigNumber | undefined }> => {
  if (!account) {
    return {};
  }

  const balancesResponse = await api.apiV1AccountAddressGet(account.address);

  return balancesResponse.data.reduce((acc, { tokenAddress, balance }) => {
    if (tokenAddress in acc) {
      throw new Error(`duplicate entries for ${tokenAddress}`);
    }

    const balanceAsBigNumber = BigNumber(balance);
    if (balanceAsBigNumber.isNaN()) {
      throw new Error(`amount is NaN, got ${balance}`);
    }

    return {
      ...acc,
      [tokenAddress]: balanceAsBigNumber,
    };
  }, {});
};
