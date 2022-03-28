import React from "react";
import { useNavigate, useLocation, NavigateFunction } from "react-router-dom";
import { LocalStorage, TopLevelRoute } from "App/types";
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
  MenuItemIconContainer,
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
        <MenuItemIconContainer>
          <Icon iconName={IconName.Briefcase} />
        </MenuItemIconContainer>
        <MenuItemTextContainer>Wallet</MenuItemTextContainer>
      </MenuItem>

      {/* Staking & Governance */}
      <StakingAndGovernanceMenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.StakingAndGovernance}`);
        }}
        isSelected={location.pathname === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemIconContainer>
          <Icon iconName={IconName.ThumbsUp} />
        </MenuItemIconContainer>
        <MenuItemTextContainer>Staking &amp; Governance</MenuItemTextContainer>
      </StakingAndGovernanceMenuItem>

      {/* Settings */}
      {/* The below is not really type safe, but enums do not
      allow computed strings, so have to figure out something
      TODO
      TopLevelRoute {
        SettingsAccounts = `${TopLevelRoute.Settings}/accounts`
      }
      */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Settings}`);
        }}
        isSelected={location.pathname.startsWith(TopLevelRoute.Settings)}
      >
        <MenuItemIconContainer>
          <Icon iconName={IconName.Settings} />
        </MenuItemIconContainer>
        <MenuItemTextContainer>Settings</MenuItemTextContainer>
      </MenuItem>
    </>
  );
};

type TopNavigationProps = {
  // this is for the toggle
  isLightMode: boolean;
  // cb for telling parent to change hte color in context
  setIsLightMode: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn?: boolean;
};
// top nav of the app, this is likely always visible.
function TopNavigation(props: TopNavigationProps): JSX.Element {
  const { isLightMode, setIsLightMode, isLoggedIn = false } = props;
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
                window.localStorage.removeItem(LocalStorage.SessionKey);
                navigate(TopLevelRoute.Home);
                window.location.reload();
              }}
            >
              <MenuItemIconContainer>
                <Icon iconName={IconName.Key} />
              </MenuItemIconContainer>
              <MenuItemTextContainer>Lock</MenuItemTextContainer>
            </MenuItem>
          )}
          {/* help button */}
          <MenuItem
            onClick={() => {
              alert("Help not implemented yet");
            }}
            style={{ margin: "0 32px 0" }}
          >
            <MenuItemIconContainer>
              <Icon iconName={IconName.HelpCircle} />
            </MenuItemIconContainer>
            <MenuItemTextContainer>Help</MenuItemTextContainer>
          </MenuItem>

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
      </TopNavigationContainerRow>
      <TopNavigationContainerSecondRow>
        <OnlyInSmall>
          {isLoggedIn && <TopNavigationMenuItems navigate={navigate} />}
        </OnlyInSmall>
      </TopNavigationContainerSecondRow>
    </TopNavigationContainer>
  );
}

export default TopNavigation;
