import { useParams, useNavigate } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "store";
import {
  AccountsState,
  DerivedAccount,
  removeAccount,
  renameAccount,
} from "slices/accounts";
import { SettingsState } from "slices/settings";

import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsAccountSettingsContainer } from "./SettingsAccountSettings.components";
import { Input } from "components/Input";
import { Button, ButtonVariant } from "components/Button";
import { Address } from "App/Token/Transfers/TransferDetails.components";
import { TopLevelRoute } from "App/types";
import { InputContainer } from "App/AccountOverview/AccountOverview.components";
import {
  BackButton,
  ButtonsContainer,
} from "App/Token/TokenSend/TokenSendForm.components";
import { Icon, IconName } from "components/Icon";
import { SettingsContent } from "../Settings.components";

type SettingsAccountSettingsParams = {
  // account alias hash of the account to set up
  id?: string;
};

/**
 * lists the account settings and allows user to change them
 */
export const SettingsAccountSettings = (): JSX.Element => {
  const params = useParams<SettingsAccountSettingsParams>();
  const navigate = useNavigate();
  const { derived } = useAppSelector<AccountsState>((state) => state.accounts);
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);
  const dispatch = useAppDispatch();

  const { id = "" } = params;
  const derivedAccounts = derived[chainId] || {};
  const account: DerivedAccount = derivedAccounts[id] || {};

  const handleDeleteAccount = (): void => {
    if (
      prompt(
        `Please type in ${account.alias} if you're sure you want to delete this account`
      ) == account.alias
    ) {
      dispatch(removeAccount({ chainId, id: account.id }));
      navigate(TopLevelRoute.SettingsAccounts);
    }
  };

  return (
    <SettingsAccountSettingsContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Account Settings</Heading>
      </NavigationContainer>

      <SettingsContent>
        {account && (
          <>
            <InputContainer>
              <Input
                label="Alias:"
                value={account.alias}
                onChangeCallback={(e) =>
                  dispatch(
                    renameAccount({
                      chainId,
                      id: account.id,
                      alias: e.target.value,
                    })
                  )
                }
              />
              <p>
                <b>Token Type:</b>
              </p>
              <p>{account.tokenType}</p>
              <p>
                <b>Established Address:</b>
              </p>
              {account.establishedAddress ? (
                <Address>{account.establishedAddress}</Address>
              ) : (
                <em>Account not yet initialized</em>
              )}
              <p>
                <b>Ed25519 Public Key:</b>
              </p>
              <Address>{account.publicKey}</Address>
              <p>
                <b>Ed25519 Signing Key:</b>
              </p>
              <Address>{account.signingKey}</Address>
            </InputContainer>

            <ButtonsContainer>
              <BackButton
                onClick={() => {
                  navigate(TopLevelRoute.SettingsAccounts);
                }}
              >
                <Icon iconName={IconName.ChevronLeft} />
              </BackButton>
              <Button
                variant={ButtonVariant.ContainedAlternative}
                onClick={handleDeleteAccount}
                style={{ marginLeft: 0 }}
              >
                Delete Account
              </Button>
            </ButtonsContainer>
          </>
        )}
      </SettingsContent>
    </SettingsAccountSettingsContainer>
  );
};
