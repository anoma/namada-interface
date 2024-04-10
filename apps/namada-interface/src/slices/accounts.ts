import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import BigNumber from "bignumber.js";
import { atom } from "jotai";

import { chains } from "@namada/chains";
import { getIntegration, Integration } from "@namada/integrations";
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
    osmosis: {}
  },
};

enum AccountsThunkActions {
  FetchBalances = "fetchBalances",
  FetchBalance = "fetchBalance",
}

function convertAddresses(accounts: AccountDetails[]): AccountDetails[] {
  if (accounts?.length < 2) return [];
  const mnemonicMap: Record<string, AccountDetails> = {};

  // Populate the map with mnemonic accounts
  accounts.forEach((obj) => {
    if (obj.type === "mnemonic") {
      mnemonicMap[obj.alias] = obj;
    }
  });

  accounts.forEach((obj) => {
    if (obj.type === "shielded-keys") {
      const mnemonic = mnemonicMap[obj.alias];
      if (mnemonic) {
        obj.publicKey = mnemonic.publicKey;
        obj.transparentAddress = mnemonic.address;
      }
    }
  });

  return accounts;
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
      const rawAccounts = action.payload;

      const id = rawAccounts[0]?.chainKey || chains.namada.id;

      // Remove old accounts under this chain config id if present:
      if (state.derived[id]) {
        state.derived[id] = {};
      }
      const cloneAccounts = JSON.parse(JSON.stringify(rawAccounts))

     const accounts = convertAddresses(cloneAccounts)

      accounts.forEach((account) => {
        const {
          address,
          alias,
          isShielded,
          chainId,
          type,
          publicKey,
          chainKey,
          transparentAddress,
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
            transparentAddress
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

      set(base, {});

      // Split accounts into transparent and shielded
      const [transparentAccounts, shieldedAccounts] = accounts.reduce((acc, curr) => {
        if (curr.isShielded) {
          acc[1].push(curr)
        } else {
          acc[0].push(curr)
        }
        return acc;
      }, [[], []] as [AccountDetails[], AccountDetails[]]);

      const token = nativeToken || tokenAddress;

      // We query the balances for the transparent accounts first as it's faster
      const transparentBalances = await Promise.all(queryBalance(namada, transparentAccounts, token));
      transparentBalances.forEach(([address, balance ]) => {
        set(base, { ...get(base), [address]: balance });
      });

      await namada.sync();

      const shieldedBalances = await Promise.all(queryBalance(namada, shieldedAccounts, token));
      shieldedBalances.forEach(([address, balance ]) => {
        set(base, { ...get(base), [address]: balance });
      });
    }
  );
})();

const queryBalance = (
  int: InstanceType<Integration>,
  accounts: AccountDetails[],
  token: string,
): Promise<readonly [string, Balance]>[] => {
  return accounts.map(async (account) => {
    const result = await int.queryBalances(account.address, [token]);
    return [
      account.address,
      result.reduce(
        (acc, curr) => ({ ...acc, [curr.token]: new BigNumber(curr.amount) }),
        {} as Balance,
      ),
    ] as const;
  });
};

export { accountsAtom, balancesAtom };
