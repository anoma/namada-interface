import { getIntegration } from "@namada/integrations";
import {
  Account as AccountDetails,
  ChainKey,
  CosmosTokenType,
  TokenBalances,
  TokenType,
} from "@namada/types";
import BigNumber from "bignumber.js";
import { getSdkInstance } from "hooks";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";

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
  //const shieldedAccounts = get(shieldedAccountsAtom);
  const transparentAccounts = get(transparentAccountsAtom);

  return {
    enabled: !!token && transparentAccounts.length > 0,
    queryKey: ["balances", token],
    queryFn: async () => {
      // We query the balances for the transparent accounts first as it's faster
      const transparentBalances = await Promise.all(
        queryBalance(transparentAccounts, token)
      );

      let balances = {};
      transparentBalances.forEach(([address, balance]) => {
        balances = { ...balances, [address]: balance };
      });

      // await namada.sync();
      // TODO: enable the following code on phase 3
      //
      // const shieldedBalances = await Promise.all(
      //   queryBalance(shieldedAccounts, token)
      // );
      //
      // shieldedBalances.forEach(([address, balance]) => {
      //   balances = { ...balances, [address]: balance };
      // });

      return balances;
    },
  };
});

const queryBalance = (
  accounts: readonly AccountDetails[],
  token: string
): Promise<[string, TokenBalances]>[] => {
  return accounts.map(async (account): Promise<[string, TokenBalances]> => {
    const { rpc } = await getSdkInstance();
    const tokens = [token];

    const balances = (await rpc.queryBalance(account.address, tokens)).map(
      ([token, amount]) => {
        return {
          token,
          amount,
        };
      }
    );

    // TODO: This is for testing
    return [account.address, { NAM: BigNumber(balances[0].amount) }];
  });
};

const keplrAccountsAtom = (() => {
  const base = atom(new Promise<readonly AccountDetails[]>(() => {}));

  return atom(
    (get) => get(base),
    (_get, set) =>
      set(
        base,
        (async () => {
          const keplr = getIntegration("cosmos");
          const accounts = await keplr.accounts();

          if (typeof accounts === "undefined") {
            throw new Error("Keplr accounts was undefined");
          }

          return accounts;
        })()
      )
  );
})();

const keplrBalancesAtom = (() => {
  const base = atom(new Promise<TokenBalances<CosmosTokenType>>(() => {}));

  return atom(
    (get) => get(base),
    (get, set) =>
      set(
        base,
        (async () => {
          const accounts = await get(keplrAccountsAtom);
          const keplr = getIntegration("cosmos");
          const supportedChainId = keplr.chain.chainId;

          // TODO: support querying balances for multiple chains
          const supportedAccount = accounts.find(
            ({ chainId }) => chainId === supportedChainId
          );

          if (typeof supportedAccount === "undefined") {
            throw new Error(
              `no Keplr account for chain ID ${supportedChainId}`
            );
          }

          return await keplr.queryBalances(supportedAccount.address);
        })()
      )
  );
})();

export { keplrAccountsAtom, keplrBalancesAtom };
