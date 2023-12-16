import { useNavigate } from "react-router-dom";

import { TopLevelRoute } from "App/types";

import {
  Button,
  ButtonVariant,
  Heading,
  Icon,
  NavigationContainer,
} from "@namada/components";
import { BackButton } from "App/Token/TokenSend/TokenSendForm.components";
import {
  ButtonsContainer,
  SettingsContainer,
  SettingsContent,
} from "./Settings.components";

/**
 * This is the root component for Settings, it contains further screens that are
 * being navigated to from here (or directly from some other locations in the app).
 */
export const Settings = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <SettingsContainer>
      <NavigationContainer>
        <Heading level="h1">Settings</Heading>
      </NavigationContainer>

      <SettingsContent>
        {/* wallet settings */}
        <Button
          onClick={() => navigate(TopLevelRoute.SettingsWalletSettings)}
          variant={ButtonVariant.Contained}
          style={{ minWidth: "50%" }}
        >
          Wallet Settings
        </Button>
      </SettingsContent>
      <ButtonsContainer>
        <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
          <Icon name="ChevronLeft" />
        </BackButton>
      </ButtonsContainer>
    </SettingsContainer>
  );
};
