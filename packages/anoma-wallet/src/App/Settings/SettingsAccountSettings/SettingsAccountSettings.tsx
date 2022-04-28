import { useParams, useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsAccountSettingsContainer } from "./SettingsAccountSettings.components";
import { useAppDispatch, useAppSelector } from "store";
import { DerivedAccount, removeAccount, renameAccount } from "slices/accounts";
import { Input } from "components/Input";
import { Button, ButtonVariant } from "components/Button";
import { useState } from "react";
import { Session } from "lib";
import {
  SeedPhraseCard,
  SeedPhraseContainer,
  SeedPhraseIndexLabel,
} from "App/AccountCreation/Steps/SeedPhrase/SeedPhrase.components";
import { Select } from "components/Select";
import { setNetwork } from "slices/settings";

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
  const [displaySeedPhrase, setDisplaySeedPhrase] = useState(false);
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const session = new Session();

  const handleDisplaySeedPhrase = (): void => {
    if (!displaySeedPhrase) {
      const password = prompt("Please input your password") || "";

      session.setSession(password);
      session
        .getSeed()
        .then((seedPhrase) => {
          setSeedPhrase((seedPhrase || "").split(" "));
          setDisplaySeedPhrase(!displaySeedPhrase);
        })
        .catch((e) => {
          alert("The inputed password is invalid. Please try again.");
        });
    } else {
      setDisplaySeedPhrase(!displaySeedPhrase);
    }
  };

  const handleNetworkSelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value } = e.target;

    dispatch(setNetwork(value));
  };

  const { id = "" } = params;
  const account: DerivedAccount = derived[id];

  const handleDeleteAccount = (): void => {
    prompt(
      `Please type in ${account.alias} if you're sure you want to delete this account`
    ) == account.alias &&
      dispatch(removeAccount(account.id)) &&
      navigate(-1);
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
        <div style={{ width: "100%" }}>
          <Input
            label="Alias:"
            value={account.alias}
            onChangeCallback={(e) =>
              dispatch(renameAccount([account.id, e.target.value]))
            }
          />
          <p>
            <Button
              variant={ButtonVariant.Contained}
              style={{ margin: "0" }}
              onClick={handleDisplaySeedPhrase}
            >
              {displaySeedPhrase ? "Hide" : "Display"} seed phrase
            </Button>
            {displaySeedPhrase && (
              <SeedPhraseContainer>
                {seedPhrase.map((seedPhraseWord, index) => {
                  return (
                    <SeedPhraseCard key={seedPhraseWord}>
                      <SeedPhraseIndexLabel>{`${
                        index + 1
                      }`}</SeedPhraseIndexLabel>
                      {`${seedPhraseWord}`}
                    </SeedPhraseCard>
                  );
                })}
              </SeedPhraseContainer>
            )}
          </p>
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
          <Select
            label="Network"
            value="default"
            data={[{ value: "default", label: "Default" }]}
            onChange={handleNetworkSelect}
          />
          <Button
            variant={ButtonVariant.ContainedAlternative}
            onClick={handleDeleteAccount}
            style={{ marginLeft: 0 }}
          >
            Delete Account
          </Button>
        </div>
      )}
    </SettingsAccountSettingsContainer>
  );
};
