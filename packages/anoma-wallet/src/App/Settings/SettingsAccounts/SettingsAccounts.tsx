import { useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { TopLevelRoute } from "App/types";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import { formatRoute } from "utils/helpers";

import {
  SettingsAccountsContainer,
  AccountRows,
  AccountRow,
  AccountNameContainer,
  AccountNameContainerOverflow,
  AccountButtonContainer,
  NewAccountButtonContainer,
  AccountAlias,
} from "./SettingsAccounts.components";
import { useAppSelector } from "store";
import { AccountsState } from "slices/accounts";

/**
 * Listing all the accounts that are persisted. By clicking one of them the account
 * gets selected to be the current active account. User can initiate a flow to add a new account
 */
export const SettingsAccounts = (): JSX.Element => {
  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const transparentAndShieldedAccounts = { ...derived, ...shieldedAccounts };
  const accounts = Object.values(derived);
  const accounts2 = Object.values(transparentAndShieldedAccounts);
  const currentAccount = useAppSelector(
    (state) => state.settings.selectedAccountID
  );

  const navigate = useNavigate();

  return (
    <SettingsAccountsContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(TopLevelRoute.Settings);
        }}
      >
        <Heading level={HeadingLevel.One}>Accounts</Heading>
      </NavigationContainer>

      <AccountRows>
        {accounts2.map((account) => {
          return (
            <AccountRow
              style={
                currentAccount == account.id
                  ? { border: "solid 1px #002046" }
                  : { border: 0 }
              }
              key={account.alias}
              disabled={!!account.shieldedKeysAndPaymentAddress}
            >
              <AccountAlias>{account.alias}</AccountAlias>
              <AccountNameContainer>
                <AccountNameContainerOverflow>
                  <Heading level={HeadingLevel.Three}>
                    {account.shieldedKeysAndPaymentAddress
                      ? account.shieldedKeysAndPaymentAddress.paymentAddress
                      : account.address}
                  </Heading>
                </AccountNameContainerOverflow>
              </AccountNameContainer>
              <AccountButtonContainer>
                <Button
                  onClick={() => {
                    navigate(
                      formatRoute(TopLevelRoute.SettingsAccountSettings, {
                        id: account.id,
                      })
                    );
                  }}
                  disabled={!!account.shieldedKeysAndPaymentAddress}
                  variant={ButtonVariant.Contained}
                  tooltip={
                    account.shieldedKeysAndPaymentAddress
                      ? "Account settings for shielded accounts are not implemented yet"
                      : ""
                  }
                >
                  Settings
                </Button>
              </AccountButtonContainer>
            </AccountRow>
          );
        })}
      </AccountRows>
      <NewAccountButtonContainer>
        <Button
          onClick={() => {
            navigate(TopLevelRoute.WalletAddAccount);
          }}
          variant={ButtonVariant.Contained}
          style={{ marginLeft: "0" }}
        >
          New Account
        </Button>
      </NewAccountButtonContainer>
    </SettingsAccountsContainer>
  );
};
