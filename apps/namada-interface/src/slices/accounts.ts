import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";
import { atom } from "jotai";

import { chains } from "@namada/chains";
import { getIntegration } from "@namada/integrations";
import { Account as AccountDetails, ChainKey, TokenType } from "@namada/types";

import { chainAtom } from "slices/chain";
import { RootState } from "store";

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

export const fetchBalances = createAsyncThunk<void, void, { state: RootState }>(
  `${ACCOUNTS_ACTIONS_BASE}/${AccountsThunkActions.FetchBalances}`,
  async (_, thunkApi) => {
    const { id } = chains.namada;
    const accounts: Account[] = Object.values(
      thunkApi.getState().accounts.derived[id]
    );

    accounts.forEach((account) => thunkApi.dispatch(fetchBalance(account)));
  }
);

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
    const integration = getIntegration(chainKey);
    const results = await integration.queryBalances(address, [
      nativeToken || tokenAddress,
    ]);
    const balance = results.reduce(
      (acc, curr) => ({ ...acc, [curr.token]: new BigNumber(curr.amount) }),
      {} as Balance
    );

    return { chainKey, address, balance };
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

const accountsAtom = (() => {
  const base = atom(new Promise<readonly AccountDetails[]>(() => {}));

  return atom(
    (get) => get(base),
    async (_get, set) => {
      const accounts = (async () => {
        const namada = getIntegration("namada");
        const result = await namada.accounts();
        if (typeof result === "undefined") {
          throw new Error("accounts was undefined!");
        }
        return result;
      })();

      set(base, accounts);
    }
  );
})();

const balancesAtom = (() => {
  const base = atom<Record<Address, Balance>>({});

  return atom(
    (get) => get(base),
    async (get, set) => {
      const accounts = await get(accountsAtom);
      const namada = getIntegration("namada");

      const {
        currency: { address: nativeToken },
      } = get(chainAtom);

      // TODO: should we be throwing away old balances here?
      const balances = get(base);

      accounts.forEach(async (account) => {
        const result = await namada.queryBalances(account.address, [
          nativeToken || tokenAddress,
        ]);
        const balance = result.reduce(
          (acc, curr) => ({ ...acc, [curr.token]: new BigNumber(curr.amount) }),
          {} as Balance
        );
        balances[account.address] = balance;
        set(
          base,
          { ...balances } // object clone ensures jotai realises object has changed
        );
      });
    }
  );
})();

export { accountsAtom, balancesAtom };
