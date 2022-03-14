import React from "react";
import { useNavigate } from "react-router-dom";
import { TopLevelRoute } from "App/types";
import { AccountCreationRoute } from "App/AccountCreation/types";
import { Image, ImageName } from "components/Image";
import { Icon, IconName } from "components/Icon";
import { Toggle } from "components/Toggle";
import {
  TopNavigationContainer,
  LeftSection,
  RightSection,
  HelpButton,
  HelpIconContainer,
  HelpTextContainer,
  ColorModeContainer,
  LogoContainer,
} from "./topNavigation.components";

type TopNavigationProps = {
  // this is for the toggle
  isLightMode: boolean;
  // cb for telling parent to change hte color in context
  setIsLightMode: React.Dispatch<React.SetStateAction<boolean>>;
};

// top nav of the app, this is likely always visible.
function TopNavigation(props: TopNavigationProps): JSX.Element {
  const { isLightMode, setIsLightMode } = props;
  const navigate = useNavigate();
  const circleElementEnabled = (
    <Icon iconName={IconName.Sun} strokeColorOverride="#17171d" />
  );
  const circleElementDisabled = (
    <Icon
      iconName={IconName.Moon}
      strokeColorOverride="#17171d"
      fillColorOverride="#17171d"
    />
  );

  return (
    <TopNavigationContainer>
      <LeftSection>
        <LogoContainer
          onClick={() => {
            navigate(`${TopLevelRoute.Home}`);
          }}
        >
          <Image
            imageName={ImageName.Logo}
            styleOverrides={{ maxWidth: "128px" }}
          />
        </LogoContainer>
      </LeftSection>

      <RightSection>
        {/* TODO: extract to Button component*/}
        {/* keys button */}
        <HelpButton
          onClick={() => {
            navigate(
              `${TopLevelRoute.AccountCreation}/${AccountCreationRoute.Initiate}`
            );
          }}
        >
          <HelpIconContainer>
            <Icon iconName={IconName.Key} />
          </HelpIconContainer>
          <HelpTextContainer>Keys</HelpTextContainer>
        </HelpButton>
        {/* help button */}
        <HelpButton
          onClick={() => {
            alert("Help not implemented yet");
          }}
        >
          <HelpIconContainer>
            <Icon iconName={IconName.HelpCircle} />
          </HelpIconContainer>
          <HelpTextContainer>Help</HelpTextContainer>
        </HelpButton>
        <ColorModeContainer>
          <Toggle
            checked={isLightMode}
            onClick={() => {
              setIsLightMode((isLightMode) => !isLightMode);
            }}
            circleElementEnabled={circleElementEnabled}
            circleElementDisabled={circleElementDisabled}
          />
        </ColorModeContainer>
      </RightSection>
    </TopNavigationContainer>
  );
}

export default TopNavigation;
