import { chains } from "@namada/chains";
import { getIntegration } from "@namada/integrations";
import {
  Account as AccountDetails,
  ChainKey,
  CosmosTokenType,
  TokenBalances,
  TokenType,
} from "@namada/types";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";
import { getSdkInstance } from "hooks";
import { atom } from "jotai";
import { atomWithQuery } from "jotai-tanstack-query";
import { RootState } from "store";

const {
  NAMADA_INTERFACE_NAMADA_TOKEN:
    tokenAddress = "tnam1qxgfw7myv4dh0qna4hq0xdg6lx77fzl7dcem8h7e",
  NAMADA_INTERFACE_NAMADA_URL: rpcUrl = "http://localhost:27657",
} = process.env;

type Address = string;
type Details = AccountDetails;

export type Balance = Partial<Record<TokenType, BigNumber>>;
export type Account = { details: Details; balance: Balance };

export type AccountsState = {
  derived: Record<ChainKey, Record<Address, Account>>;
};

const ACCOUNTS_ACTIONS_BASE = "accounts";

const INITIAL_STATE = {
  derived: {
    namada: {},
    cosmos: {},
    ethereum: {},
  },
};

enum AccountsThunkActions {
  FetchBalances = "fetchBalances",
  FetchBalance = "fetchBalance",
}

const initialState: AccountsState = INITIAL_STATE;

// TODO: fetchBalance is broken for integrations other than Namada. This
// function should be removed and new code should use the jotai atoms instead.
export const fetchBalance = createAsyncThunk<
  {
    chainKey: ChainKey;
    address: string;
    balance: Balance;
  },
  Account,
  { state: RootState }
>(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountsThunkActions.FetchBalance}`,
  async (account, thunkApi) => {
    const { address, chainKey } = account.details;
    const {
      currency: { address: nativeToken },
    } = thunkApi.getState().chain.config;
    if (chainKey !== "namada") {
      throw new Error("not namada");
    }
    const { rpc } = await getSdkInstance();
    const tokens = [nativeToken || tokenAddress];

    const balances = (await rpc.queryBalance(address, tokens)).map(
      ([token, amount]) => {
        return {
          token,
          amount,
        };
      }
    );

    return {
      chainKey,
      address,
      balance: { NAM: BigNumber(balances[0].amount) },
    };
  }
);

const accountsSlice = createSlice({
  name: ACCOUNTS_ACTIONS_BASE,
  initialState,
  reducers: {
    addAccounts: (state, action: PayloadAction<readonly AccountDetails[]>) => {
      const accounts = action.payload;

      const id = accounts[0]?.chainKey || chains.namada.id;

      // Remove old accounts under this chain config id if present:
      if (state.derived[id]) {
        state.derived[id] = {};
      }

      accounts.forEach((account) => {
        const {
          address,
          alias,
          isShielded,
          chainId,
          type,
          publicKey,
          chainKey,
        } = account;
        const currencySymbol = chains.namada.currency.symbol;
        if (!state.derived[id]) {
          state.derived[id] = {};
        }

        state.derived[id][address] = {
          details: {
            address,
            alias,
            chainId,
            type,
            publicKey,
            isShielded,
            chainKey,
          },
          balance: {
            [currencySymbol]: new BigNumber(0),
          },
        };
      });
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      fetchBalance.fulfilled,
      (
        state,
        action: PayloadAction<{
          chainKey: ChainKey;
          address: string;
          balance: Balance;
        }>
      ) => {
        const { address, balance, chainKey } = action.payload;
        if (state.derived[chainKey][address]?.balance) {
          state.derived[chainKey][address].balance = balance;
        } else {
          delete state.derived[chainKey][address];
        }
      }
    );
  },
});

const { actions, reducer } = accountsSlice;

export const { addAccounts } = actions;
export default reducer;

////////////////////////////////////////////////////////////////////////////////
// JOTAI
////////////////////////////////////////////////////////////////////////////////
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
