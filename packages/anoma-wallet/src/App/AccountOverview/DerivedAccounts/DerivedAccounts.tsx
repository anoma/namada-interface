import { useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "store";
import { AccountsState, fetchBalanceByAddress } from "slices/accounts";
import { formatRoute } from "utils/helpers";
import { TopLevelRoute } from "App/types";

import {
  DerivedAccountsContainer,
  DerivedAccountsList,
  DerivedAccountItem,
  DerivedAccountAddress,
  DerivedAccountAlias,
  DerivedAccountBalance,
  DerivedAccountType,
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
          dispatch(fetchBalanceByAddress(account));
        }
      });
    }
  }, []);

  return (
    <DerivedAccountsContainer>
      <DerivedAccountsList>
        {Object.keys(derived).map((hash: string) => {
          const { alias, tokenType, establishedAddress, balance } =
            derived[hash];

          return (
            <DerivedAccountItem key={alias}>
              <DerivedAccountAlias>{alias}</DerivedAccountAlias>
              <DerivedAccountType>{tokenType}</DerivedAccountType>
              <DerivedAccountBalance>
                <span>Balance:</span>{" "}
                {typeof balance === "number" ? balance : "Loading"}
              </DerivedAccountBalance>
              <DerivedAccountAddress>
                {establishedAddress}
              </DerivedAccountAddress>
              <Button
                onClick={() => {
                  navigate(formatRoute(TopLevelRoute.Token, { hash }));
                }}
                variant={ButtonVariant.Contained}
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

export default memo(DerivedAccounts);
