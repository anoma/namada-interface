import { useParams, useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsAccountSettingsContainer } from "./SettingsAccountSettings.components";
import { useAppDispatch, useAppSelector } from "store";
import { DerivedAccount, removeAccount, renameAccount } from "slices/accounts";
import { Input } from "components/Input";
import { Button, ButtonVariant } from "components/Button";
import { Address } from "App/Token/Transfers/TransferDetails.components";
import { TopLevelRoute } from "App/types";
import { InputContainer } from "App/AccountOverview/AccountOverview.components";

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
  const { derived } = useAppSelector((state) => state.accounts);
  const dispatch = useAppDispatch();

  const { id = "" } = params;
  const account: DerivedAccount = derived[id];

  const handleDeleteAccount = (): void => {
    if (
      prompt(
        `Please type in ${account.alias} if you're sure you want to delete this account`
      ) == account.alias
    ) {
      dispatch(removeAccount(account.id));
      navigate(TopLevelRoute.SettingsAccounts);
    }
  };

  return (
    <SettingsAccountSettingsContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Account Settings</Heading>
      </NavigationContainer>

      {account && (
        <InputContainer>
          <Input
            label="Alias:"
            value={account.alias}
            onChangeCallback={(e) =>
              dispatch(renameAccount([account.id, e.target.value]))
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

          <Button
            variant={ButtonVariant.ContainedAlternative}
            onClick={handleDeleteAccount}
            style={{ marginLeft: 0 }}
          >
            Delete Account
          </Button>
        </InputContainer>
      )}
    </SettingsAccountSettingsContainer>
  );
};
