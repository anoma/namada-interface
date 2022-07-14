import { useNavigate } from "react-router-dom";

import { TopLevelRoute } from "App/types";

import { NavigationContainer } from "components/NavigationContainer";
import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsContainer, SettingsContent } from "./Settings.components";
import { BackButton } from "App/Token/TokenSend/TokenSendForm.components";
import { Icon, IconName } from "components/Icon";
import { ButtonsContainer } from "App/Token/TokenDetails.components";

/**
 * This is the root component for Settings, it contains further screens that are
 * being navigated to from here (or directly from some other locations in the app).
 */
export const Settings = (): JSX.Element => {
  const navigate = useNavigate();

  return (
    <SettingsContainer>
      <NavigationContainer>
        <Heading level={HeadingLevel.Two}>Settings</Heading>
      </NavigationContainer>

      <SettingsContent>
        {/* accounts button */}
        <Button
          onClick={() => navigate(TopLevelRoute.SettingsAccounts)}
          variant={ButtonVariant.Contained}
          style={{ minWidth: "50%" }}
        >
          Accounts
        </Button>

        {/* wallet settings */}
        <Button
          onClick={() => navigate(TopLevelRoute.SettingsWalletSettings)}
          variant={ButtonVariant.Contained}
          style={{ minWidth: "50%" }}
        >
          Wallet Settings
        </Button>
        <ButtonsContainer>
          <BackButton onClick={() => navigate(TopLevelRoute.Wallet)}>
            <Icon iconName={IconName.ChevronLeft} />
          </BackButton>
        </ButtonsContainer>
      </SettingsContent>
    </SettingsContainer>
  );
};
