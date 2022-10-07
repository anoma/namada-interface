import { ColorModeContainer, OnlyInMedium } from "./topNavigation.components";
import { Toggle } from "components/Toggle";
import { useNavigate } from "react-router-dom";
import { Icon, IconName } from "components/Icon";
import { TopLevelRoute } from "App/types";

import {
  SettingsButton,
  TopNavigationLoggedInContainer,
  TopNavigationLoggedInControlsContainer,
} from "./topNavigationLoggedIn.components";

type Props = {
  isLightMode: boolean;
  toggleColorMode: () => void;
  topLevelRoute?: TopLevelRoute;
};

const TopNavigationLoggedIn = (props: Props): JSX.Element => {
  const { isLightMode, toggleColorMode, topLevelRoute } = props;
  const navigate = useNavigate();

  return (
    <TopNavigationLoggedInContainer>
      <OnlyInMedium>
        <TopNavigationLoggedInControlsContainer>
          <SettingsButton
            onClick={() => {
              navigate(`${TopLevelRoute.Settings}`);
            }}
          >
            <Icon iconName={IconName.Settings} />
          </SettingsButton>
          <ColorModeContainer>
            {topLevelRoute !== TopLevelRoute.StakingAndGovernance && (
              <Toggle
                checked={isLightMode}
                onClick={() => {
                  toggleColorMode();
                }}
              />
            )}
          </ColorModeContainer>
        </TopNavigationLoggedInControlsContainer>
      </OnlyInMedium>
    </TopNavigationLoggedInContainer>
  );
};

export default TopNavigationLoggedIn;
