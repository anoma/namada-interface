import { useNavigate } from "react-router-dom";

import { TopLevelRoute } from "App/types";

import { NavigationContainer } from "components/NavigationContainer";
import { Button, ButtonVariant } from "components/Button";
import { Heading, HeadingLevel } from "components/Heading";
import { SettingsContainer } from "./Settings.components";

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
    </SettingsContainer>
  );
};
