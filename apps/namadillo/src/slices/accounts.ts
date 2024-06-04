import {
  DefaultApi,
  Balance as IndexerBalance,
} from "@anomaorg/namada-indexer-client";
import { getIntegration } from "@namada/integrations";
import { Account as AccountDetails, ChainKey, TokenType } from "@namada/types";
import BigNumber from "bignumber.js";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { shouldUpdateBalanceAtom } from "./etc";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
} = process.env;

type Address = string;
type Details = AccountDetails;

export type Balance = Partial<Record<TokenType, BigNumber>>;
export type Account = { details: Details; balance: Balance };

export type AccountsState = {
  derived: Record<ChainKey, Record<Address, Account>>;
};

export const accountsAtom = atom<readonly AccountDetails[]>([]);

export const addAccountsAtom = atom(
  null,
  (_get, set, accounts: readonly AccountDetails[]) => {
    set(accountsAtom, accounts);
  }
);

export const transparentAccountsAtom = atom<readonly AccountDetails[]>((get) =>
  get(accountsAtom).filter((account) => !account.isShielded)
);

export const shieldedAccountsAtom = atom<readonly AccountDetails[]>((get) =>
  get(accountsAtom).filter((account) => account.isShielded)
);

export const refreshAccountsAtom = atom(null, (_get, set) =>
  set(accountsAtom, [])
);

export const fetchAccountsAtom = atom(
  (get) => get(accountsAtom),
  async (_get, set) => {
    const namada = getIntegration("namada");
    const result = await namada.accounts();
    if (typeof result === "undefined") {
      throw new Error("accounts was undefined!");
    }
    set(accountsAtom, result);
  }
);

export const defaultAccountAtom = atom<AccountDetails | undefined>(undefined);

export const fetchDefaultAccountAtom = atom(
  (get) => get(defaultAccountAtom),
  async (_get, set) => {
    const namada = getIntegration("namada");
    const result = await namada.defaultAccount();
    if (typeof result === "undefined") {
      throw new Error("account was undefined!");
    }
    set(defaultAccountAtom, result);
  }
);

export const totalNamBalanceAtom = atomWithQuery<BigNumber>((get) => {
  const balances = get(balancesAtom);
  return {
    enabled: balances.isSuccess,
    queryKey: ["totalNamBalance", balances.dataUpdatedAt],
    queryFn: () => {
      return Object.values(balances.data!).reduce(
        (prev, current) => prev.plus(current["NAM"] || 0),
        new BigNumber(0)
      );
    },
  };
});

export const balancesAtom = atomWithQuery<Record<Address, Balance>>((get) => {
  const token = tokenAddress;
  const transparentAccounts = get(transparentAccountsAtom);
  const enablePolling = get(shouldUpdateBalanceAtom);

  return {
    enabled: !!token && transparentAccounts.length > 0,
    // TODO: subscribe to indexer events when it's done
    refetchInterval: enablePolling ? 1000 : false,
    queryKey: ["balances", token],
    queryFn: async () => {
      const api = new DefaultApi();
      const balancePairs = await Promise.all(
        transparentAccounts.map(({ address }) =>
          api
            .apiV1AccountAddressGet(address)
            .then((response) => [address, response] as const)
        )
      );

      const balances = balancePairs.reduce(
        (acc, [address, response]) => {
          const balances = response.data as IndexerBalance[];
          // TODO: we index only NAM balance for now
          const namBalance = balances[0];

          if (typeof namBalance !== "undefined") {
            acc[address] = {
              NAM: BigNumber(namBalance.balance || "0"),
            };
          }

          return acc;
        },
        {} as Record<Address, Balance>
      );

      return balances;
    },
  };
});
