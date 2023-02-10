import { useNavigate } from "react-router-dom";

import { TopLevelRoute } from "App/types";

import {
  Button,
  ButtonVariant,
  Heading,
  HeadingLevel,
  Icon,
  IconName,
  NavigationContainer,
} from "@anoma/components";
import {
  SettingsContainer,
  SettingsContent,
  ButtonsContainer,
} from "./Settings.components";
import { BackButton } from "App/Token/TokenSend/TokenSendForm.components";

/**
 * This is the root component for Settings, it contains further screens that are
 * being navigated to from here (or directly from some other locations in the app).
 */
export const Settings = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <SettingsContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.One}>Settings</Heading>
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
          <Icon iconName={IconName.ChevronLeft} />
        </BackButton>
      </ButtonsContainer>
    </SettingsContainer>
  );
};
