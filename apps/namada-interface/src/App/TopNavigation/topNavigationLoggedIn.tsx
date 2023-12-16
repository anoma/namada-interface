import { useNavigate } from "react-router-dom";

import { Icon, Toggle } from "@namada/components";
import { ColorMode } from "@namada/utils";

import { TopLevelRoute } from "App/types";
import { ColorModeContainer, OnlyInMedium } from "./topNavigation.components";
import {
  SettingsButton,
  TopNavigationLoggedInContainer,
  TopNavigationLoggedInControlsContainer,
} from "./topNavigationLoggedIn.components";

type Props = {
  colorMode: ColorMode;
  toggleColorMode: () => void;
};

const TopNavigationLoggedIn = (props: Props): JSX.Element => {
  const { colorMode, toggleColorMode } = props;
  const navigate = useNavigate();

  return (
    <TopNavigationLoggedInContainer>
      <OnlyInMedium>
        <TopNavigationLoggedInControlsContainer>
          <SettingsButton
            onClick={() => {
              navigate(`${TopLevelRoute.SettingsWalletSettings}`);
            }}
          >
            <Icon name="Settings" />
          </SettingsButton>
          <ColorModeContainer>
            <Toggle
              checked={colorMode === "dark"}
              onClick={() => {
                toggleColorMode();
              }}
            />
          </ColorModeContainer>
        </TopNavigationLoggedInControlsContainer>
      </OnlyInMedium>
    </TopNavigationLoggedInContainer>
  );
};

export default TopNavigationLoggedIn;
