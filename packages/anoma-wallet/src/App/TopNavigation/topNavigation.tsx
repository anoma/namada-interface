import React from "react";
import { useNavigate, useLocation, NavigateFunction } from "react-router-dom";
import { TopLevelRoute } from "App/types";
import { Image, ImageName } from "components/Image";
import { Icon, IconName } from "components/Icon";
import { Toggle } from "components/Toggle";
import {
  TopNavigationContainer,
  LeftSection,
  MiddleSection,
  RightSection,
  MenuItem,
  StakingAndGovernanceMenuItem,
  MenuItemTextContainer,
  ColorModeContainer,
  LogoContainer,
  OnlyInSmall,
  OnlyInMedium,
  TopNavigationContainerRow,
  TopNavigationContainerSecondRow,
} from "./topNavigation.components";

/**
 * this is rendered in one of 2 places depending of the screen size
 */
const TopNavigationMenuItems = (props: {
  navigate: NavigateFunction;
}): React.ReactElement => {
  const { navigate } = props;
  const location = useLocation();

  return (
    <>
      {/* Wallet */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Wallet}`);
        }}
        isSelected={location.pathname === TopLevelRoute.Wallet}
      >
        <MenuItemTextContainer>Wallet</MenuItemTextContainer>
      </MenuItem>

      {/* Staking */}
      <StakingAndGovernanceMenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.StakingAndGovernance}`);
        }}
        isSelected={location.pathname === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemTextContainer>Staking</MenuItemTextContainer>
      </StakingAndGovernanceMenuItem>

      {/* Governance */}
      <StakingAndGovernanceMenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.StakingAndGovernance}`);
        }}
        isSelected={location.pathname === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemTextContainer>Governance</MenuItemTextContainer>
      </StakingAndGovernanceMenuItem>
    </>
  );
};

type TopNavigationProps = {
  // this is for the toggle
  isLightMode: boolean;
  // cb for telling parent to change hte color in context
  setIsLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn?: boolean;
  logout: () => void;
};
// top nav of the app, this is likely always visible.
function TopNavigation(props: TopNavigationProps): JSX.Element {
  const { isLightMode, logout, setIsLightMode, isLoggedIn = false } = props;
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
      <TopNavigationContainerRow>
        <LeftSection>
          &nbsp;
          {isLoggedIn && (
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Home);
              }}
            >
              <Image
                imageName={ImageName.Logo}
                styleOverrides={{ maxWidth: "128px" }}
              />
            </LogoContainer>
          )}
        </LeftSection>

        <MiddleSection>
          <OnlyInMedium>
            {isLoggedIn && <TopNavigationMenuItems navigate={navigate} />}
          </OnlyInMedium>
        </MiddleSection>

        <RightSection>
          {/* TODO: extract to Button component*/}
          {isLoggedIn && (
            <MenuItem
              onClick={() => {
                navigate(TopLevelRoute.Home);
                logout();
              }}
            >
              <MenuItemTextContainer>Lock</MenuItemTextContainer>
            </MenuItem>
          )}
        </RightSection>
      </TopNavigationContainerRow>
      <TopNavigationContainerSecondRow>
        <OnlyInSmall>
          {isLoggedIn && <TopNavigationMenuItems navigate={navigate} />}
        </OnlyInSmall>
        {isLoggedIn && (
          <>
            <a
              onClick={() => {
                navigate(`${TopLevelRoute.Settings}`);
              }}
            >
              <Icon iconName={IconName.Settings} />
            </a>
            <ColorModeContainer>
              <Toggle
                checked={isLightMode}
                onClick={() => {
                  setIsLightMode((isLightMode) => !isLightMode);
                }}
              />
            </ColorModeContainer>
          </>
        )}
        {!isLoggedIn && (
          <>
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Home);
              }}
            >
              <Image
                imageName={ImageName.Logo}
                styleOverrides={{ maxWidth: "128px" }}
              />
            </LogoContainer>
            <ColorModeContainer>
              <Toggle
                checked={isLightMode}
                onClick={() => {
                  setIsLightMode((isLightMode) => !isLightMode);
                }}
              />
            </ColorModeContainer>
          </>
        )}
      </TopNavigationContainerSecondRow>
    </TopNavigationContainer>
  );
}

export default TopNavigation;
