import { useParams, useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsAccountSettingsContainer } from "./SettingsAccountSettings.components";
import { useAppSelector } from "store";
import { DerivedAccount } from "slices/accounts";

type SettingsAccountSettingsParams = {
  // account alias hash of the account to set up
  hash?: string;
};

/**
 * lists the account settings and allows user to change them
 */
export const SettingsAccountSettings = (): JSX.Element => {
  const params = useParams<SettingsAccountSettingsParams>();
  const navigate = useNavigate();
  const { derived } = useAppSelector((state) => state.accounts);

  const { hash = "" } = params;
  const account: DerivedAccount = derived[hash];

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
        <div style={{ width: "100%" }}>
          <p>
            <b>Alias:</b>
          </p>
          <p>{account.alias}</p>
          <p>
            <b>Token Type:</b>
          </p>
          <p>{account.tokenType}</p>
          <p>
            <b>Address (WIF):</b>
          </p>
          <pre>{account.address}</pre>
          <p>
            <b>Established Address:</b>
          </p>
          <pre style={{ width: "100%", overflow: "auto" }}>
            {account.establishedAddress}
          </pre>
          <p>
            <b>Ed25519 Public Key:</b>
          </p>
          <pre style={{ width: "100%", overflow: "auto" }}>
            {account.publicKey}
          </pre>
          <p>
            <b>Ed25519 Signing Key:</b>
          </p>
          <pre style={{ width: "100%", overflow: "auto" }}>
            {account.signingKey}
          </pre>
        </div>
      )}
      <a
        href="https://github.com/anoma/spec/blob/master/src/architecture/namada/web-wallet/user-interfaces.md#accountoverview-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        Spec &gt; SettingsAccountSettings
      </a>
    </SettingsAccountSettingsContainer>
  );
};
