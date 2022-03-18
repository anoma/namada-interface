import { useNavigate } from "react-router-dom";
import { NavigationContainer } from "components/NavigationContainer";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsWalletSettingsContainer } from "./SettingsWalletSettings.components";

export const SettingsWalletSettings = (): JSX.Element => {
  const navigate = useNavigate();
  return (
    <SettingsWalletSettingsContainer>
      <NavigationContainer
        onBackButtonClick={() => {
          navigate(-1);
        }}
      >
        <Heading level={HeadingLevel.One}>Wallet Settings</Heading>
      </NavigationContainer>

      <a
        href="https://github.com/anoma/spec/blob/master/src/architecture/namada/web-wallet/user-interfaces.md#settingswalletsettings"
        target="_blank"
        rel="noopener noreferrer"
      >
        SettingsWalletSettings
      </a>
    </SettingsWalletSettingsContainer>
  );
};
