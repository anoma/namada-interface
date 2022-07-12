import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, fetchBalanceByAccount } from "slices/accounts";
import { SettingsState } from "slices/settings";
import { updateShieldedBalances } from "slices/accountsNew";

import {
  DerivedAccountsContainer,
  DerivedAccountsList,
  DerivedAccountItem,
  DerivedAccountBalance,
  DerivedAccountType,
  DerivedAccountInfo,
  DerivedAccountAlias,
  DerivedAccountContainer,
} from "./DerivedAccounts.components";

const DerivedAccounts = (): JSX.Element => {
  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const derivedAccounts = derived[chainId] || {};

  const dispatch = useAppDispatch();

  useEffect(() => {
    const keys = Object.keys(derivedAccounts);
    if (keys.length > 0) {
      keys.forEach((key) => {
        const account = derivedAccounts[key];
        if (!account.balance) {
          dispatch(fetchBalanceByAccount(account));
        }
      });
    }

    dispatch(updateShieldedBalances());
  }, []);

  const shieldedAndTransparentAccounts = {
    ...derivedAccounts,
    ...(shieldedAccounts[chainId] || {}),
  };

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {Object.keys(shieldedAndTransparentAccounts)
          .reverse()
          .map((hash: string) => {
            const {
              id,
              alias,
              tokenType,
              balance,
              isInitializing,
              isShielded,
            } = shieldedAndTransparentAccounts[hash];

            return (
              <DerivedAccountItem key={id}>
                <DerivedAccountContainer>
                  <DerivedAccountInfo>
                    <DerivedAccountAlias>
                      {alias} {isInitializing && <i>(initializing)</i>}
                    </DerivedAccountAlias>
                    <DerivedAccountType>
                      {isShielded ? "SHIELDED " : ""}
                    </DerivedAccountType>
                  </DerivedAccountInfo>

                  <DerivedAccountBalance>
                    {typeof balance === "number" ? balance : "Loading"}{" "}
                    {tokenType}
                  </DerivedAccountBalance>
                </DerivedAccountContainer>
              </DerivedAccountItem>
            );
          })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default DerivedAccounts;
