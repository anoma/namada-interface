import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, fetchBalanceByAccount } from "slices/accounts";
import { formatRoute } from "utils/helpers";
import { TopLevelRoute } from "App/types";

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
import { Button, ButtonVariant } from "components/Button";

const DerivedAccounts = (): JSX.Element => {
  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const keys = Object.keys(derived);
    if (keys.length > 0) {
      keys.forEach((key) => {
        const account = derived[key];
        if (!account.balance) {
          dispatch(fetchBalanceByAccount(account));
        }
      });
    }
  }, []);

  const shieldedAndTransparentAccounts = { ...derived, ...shieldedAccounts };
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
              <DerivedAccountItem key={alias}>
                <DerivedAccountContainer>
                  <DerivedAccountInfo>
                    <DerivedAccountAlias>
                      {alias} {isInitializing && <i>(initializing)</i>}
                    </DerivedAccountAlias>
                    <DerivedAccountType>
                      {isShielded ? "SHIELDED " : ""}
                      {tokenType}
                    </DerivedAccountType>
                  </DerivedAccountInfo>

                  <DerivedAccountBalance>
                    {typeof balance === "number" ? balance : "Loading"}
                  </DerivedAccountBalance>
                </DerivedAccountContainer>

                <Button
                  onClick={() => {
                    navigate(formatRoute(TopLevelRoute.Token, { id }));
                  }}
                  variant={ButtonVariant.Small}
                >
                  Details
                </Button>
              </DerivedAccountItem>
            );
          })}
      </DerivedAccountsList>
    </DerivedAccountsContainer>
  );
};

export default DerivedAccounts;
