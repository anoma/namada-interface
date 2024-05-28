import { useNavigate } from "react-router-dom";

import { Heading, Icon, NavigationContainer } from "@namada/components";
import { BackButton } from "App/Token/TokenSend/TokenSendForm.components";
import { ButtonsContainer, SettingsContent } from "../Settings.components";
import { SettingsWalletSettingsContainer } from "./SettingsWalletSettings.components";

export const SettingsWalletSettings = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <SettingsWalletSettingsContainer>
      <NavigationContainer>
        <Heading level="h1">Wallet Settings</Heading>
      </NavigationContainer>

      <SettingsContent></SettingsContent>
      <ButtonsContainer>
        <BackButton
          onClick={() => {
            navigate(-1);
          }}
        >
          <Icon name="ChevronLeft" />
        </BackButton>
      </ButtonsContainer>
    </SettingsWalletSettingsContainer>
  );
};
