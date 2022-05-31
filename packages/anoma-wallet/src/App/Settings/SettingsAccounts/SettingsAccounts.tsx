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
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const accounts = Object.values(derived);
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
        {accounts.map((account) => {
          return (
            <AccountRow
              style={
                currentAccount == account.id
                  ? { border: "solid 1px #002046" }
                  : { border: 0 }
              }
              key={account.alias}
            >
              <AccountAlias>{account.alias}</AccountAlias>
              <AccountNameContainer>
                <AccountNameContainerOverflow>
                  <Heading level={HeadingLevel.Three}>
                    {account.address}
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
                  variant={ButtonVariant.Contained}
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
