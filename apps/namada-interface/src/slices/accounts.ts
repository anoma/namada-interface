import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";
import { atom } from "jotai";

import { chains } from "@namada/chains";
import { getIntegration, Namada } from "@namada/integrations";
import {
  Account as AccountDetails,
  ChainKey,
  CosmosTokenType,
  TokenBalances,
  TokenType,
} from "@namada/types";

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
    const integration = getIntegration(chainKey);
    const balance = await integration.queryBalances(address, [
      nativeToken || tokenAddress,
    ]);

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
  const base = atom<{ [address: Address]: TokenBalances }>({});

  return atom(
    (get) => get(base),
    async (get, set) => {
      const accounts = await get(accountsAtom);
      const namada = getIntegration("namada");

      const {
        currency: { address: nativeToken },
      } = get(chainAtom);

      set(base, {});

      // Split accounts into transparent and shielded
      const [transparentAccounts, shieldedAccounts] = accounts.reduce(
        (acc, curr) => {
          if (curr.isShielded) {
            acc[1].push(curr);
          } else {
            acc[0].push(curr);
          }
          return acc;
        },
        [[], []] as [AccountDetails[], AccountDetails[]]
      );

      const token = nativeToken || tokenAddress;

      // We query the balances for the transparent accounts first as it's faster
      const transparentBalances = await Promise.all(
        queryBalance(namada, transparentAccounts, token)
      );
      transparentBalances.forEach(([address, balance]) => {
        set(base, { ...get(base), [address]: balance });
      });

      await namada.sync();

      const shieldedBalances = await Promise.all(
        queryBalance(namada, shieldedAccounts, token)
      );
      shieldedBalances.forEach(([address, balance]) => {
        set(base, { ...get(base), [address]: balance });
      });
    }
  );
})();

const queryBalance = (
  namada: Namada,
  accounts: AccountDetails[],
  token: string
): Promise<[string, TokenBalances]>[] => {
  return accounts.map(async (account): Promise<[string, TokenBalances]> => {
    const balances = await namada.queryBalances(account.address, [token]);
    return [account.address, balances];
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

export { accountsAtom, balancesAtom, keplrAccountsAtom, keplrBalancesAtom };
