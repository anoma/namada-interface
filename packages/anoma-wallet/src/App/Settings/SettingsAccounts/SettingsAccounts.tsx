import { useNavigate } from "react-router-dom";
import { TopLevelRoute } from "App/types";
import { formatRoute } from "utils/helpers";
import { useAppSelector } from "store";
import { AccountsState } from "slices/accounts";
import { SettingsState } from "slices/settings";

import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { Button, ButtonVariant } from "components/Button";
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
import {
  BackButton,
  ButtonsContainer,
} from "App/Token/TokenSend/TokenSendForm.components";
import { Icon, IconName } from "components/Icon";
import { SettingsContent } from "../Settings.components";

/**
 * Listing all the accounts that are persisted. By clicking one of them the account
 * gets selected to be the current active account. User can initiate a flow to add a new account
 */
export const SettingsAccounts = (): JSX.Element => {
  const { derived, shieldedAccounts } = useAppSelector<AccountsState>(
    (state) => state.accounts
  );
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const derivedAccounts = derived[chainId] || {};
  const transparentAndShieldedAccounts = {
    ...derivedAccounts,
    ...(shieldedAccounts[chainId] || {}),
  };

  const accounts = Object.values(transparentAndShieldedAccounts);

  const navigate = useNavigate();

  return (
    <SettingsAccountsContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Accounts</Heading>
      </NavigationContainer>

      <SettingsContent>
        <AccountRows>
          {accounts.map((account) => {
            return (
              <AccountRow
                key={account.id}
                disabled={!!account.shieldedKeysAndPaymentAddress}
              >
                <AccountAlias>
                  {account.alias}&nbsp;
                  <span>{account.isShielded ? "Shielded" : "Transparent"}</span>
                </AccountAlias>
                <AccountNameContainer>
                  <AccountNameContainerOverflow>
                    <Heading level={HeadingLevel.Three}>
                      {account.shieldedKeysAndPaymentAddress
                        ? account.shieldedKeysAndPaymentAddress.paymentAddress
                        : account.establishedAddress}
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
        <NewAccountButtonContainer></NewAccountButtonContainer>
        <ButtonsContainer>
          <BackButton onClick={() => navigate(TopLevelRoute.Settings)}>
            <Icon iconName={IconName.ChevronLeft} />
          </BackButton>
          <Button
            onClick={() => {
              navigate(TopLevelRoute.WalletAddAccount);
            }}
            variant={ButtonVariant.Contained}
            style={{ marginLeft: "0" }}
          >
            New Account
          </Button>
        </ButtonsContainer>
      </SettingsContent>
    </SettingsAccountsContainer>
  );
};
