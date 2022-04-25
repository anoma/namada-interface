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
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
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

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {Object.keys(derived)
          .reverse()
          .map((hash: string) => {
            const { id, alias, tokenType, balance, isInitializing } =
              derived[hash];

            return (
              <DerivedAccountItem key={alias}>
                <DerivedAccountContainer>
                  <DerivedAccountInfo>
                    <DerivedAccountAlias>
                      {alias} {isInitializing && <i>(initializing)</i>}
                    </DerivedAccountAlias>
                    <DerivedAccountType>{tokenType}</DerivedAccountType>
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
