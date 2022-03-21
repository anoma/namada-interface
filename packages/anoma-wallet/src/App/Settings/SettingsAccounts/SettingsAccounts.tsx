import { useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { TopLevelRoute } from "App/types";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
import { AccountCreationRoute } from "App/Settings/SettingsAccountCreation/types";
import {
  SettingsAccountsContainer,
  AccountRows,
  AccountRow,
  AccountNameContainer,
  AccountNameContainerOverflow,
  AccountButtonContainer,
  NewAccountButtonContainer,
} from "./SettingsAccounts.components";

type SettingsAccountsProps = {
  // currently selected account alias
  selectedAccountAlias?: string;

  // all persisted account aliases
  accounts: string[];
};

/**
 * Listing all the accounts that are persisted. By clicking one of them the account
 * gets selected to be the current active account. User can initiate a flow to add a new account
 */
export const SettingsAccounts = (props: SettingsAccountsProps): JSX.Element => {
  const { accounts } = props;
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
            <AccountRow key={account}>
              <AccountNameContainer>
                <AccountNameContainerOverflow>
                  <Heading level={HeadingLevel.Three}>{account}</Heading>
                </AccountNameContainerOverflow>
              </AccountNameContainer>
              <AccountButtonContainer>
                <Button
                  onClick={() => {
                    navigate(
                      `${TopLevelRoute.SettingsAccountSettings}/${account}`
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
            navigate(`${TopLevelRoute.SettingsAccountCreation}`);
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
