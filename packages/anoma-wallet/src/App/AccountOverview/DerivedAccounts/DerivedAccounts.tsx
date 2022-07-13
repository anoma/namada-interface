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
import { Image, ImageName } from "components/Image";
import { Button, ButtonVariant } from "components/Button";

type Props = {
  setTotal: (total: number) => void;
};

const DerivedAccounts = ({ setTotal }: Props): JSX.Element => {
  const { derived, shieldedAccounts: allShieldedAccounts } =
    useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const derivedAccounts = derived[chainId] || {};
  const shieldedAccounts = allShieldedAccounts[chainId] || {};

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

    if (Object.values(shieldedAccounts).length > 0) {
      dispatch(updateShieldedBalances());
    }
  }, []);

  const shieldedAndTransparentAccounts = {
    ...derivedAccounts,
    ...shieldedAccounts,
  };

  useEffect(() => {
    if (Object.values(shieldedAndTransparentAccounts).length > 0) {
      const total = Object.values(shieldedAndTransparentAccounts).reduce(
        (acc, account) => {
          const { balance } = account;

          return acc + balance;
        },
        0
      );
      setTotal(total);
    }
  }, [shieldedAndTransparentAccounts]);

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
                    {/* LOGO - TODO: Set these logos by asset */}
                    <Button
                      style={{
                        padding: 0,
                        margin: "0 12px 0 0",
                        height: 36,
                        width: 36,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                      variant={ButtonVariant.Contained}
                    >
                      <Image
                        imageName={ImageName.LogoMinimal}
                        styleOverrides={{
                          height: 24,
                          width: 24,
                          margin: 0,
                          padding: 0,
                        }}
                      />
                    </Button>

                    <div>
                      <DerivedAccountAlias>
                        {alias} {isInitializing && <i>(initializing)</i>}
                      </DerivedAccountAlias>
                      <DerivedAccountType>
                        {isShielded ? "Shielded " : "Transparent"}
                      </DerivedAccountType>
                    </div>
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
