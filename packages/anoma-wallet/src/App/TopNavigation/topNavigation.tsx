import React from "react";
import { useNavigate, useLocation, NavigateFunction } from "react-router-dom";
import { Persistor } from "redux-persist";
import { Provider } from "react-redux";

import { TopLevelRoute } from "App/types";
import { Image, ImageName } from "components/Image";
import { Toggle } from "components/Toggle";
import {
  TopNavigationContainer,
  LeftSection,
  MiddleSection,
  RightSection,
  MenuItem,
  MenuItemTextContainer,
  ColorModeContainer,
  LogoContainer,
  // OnlyInSmall,
  // OnlyInMedium,
  TopNavigationContainerRow,
  TopNavigationContainerSecondRow,
  TopNavigationLogoContainer,
} from "./topNavigation.components";

import { AppStore } from "store/store";
import TopNavigationLoggedIn from "./topNavigationLoggedIn";
import { SettingsButton } from "./topNavigationLoggedIn.components";
import { Icon, IconName } from "components/Icon";

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

      {/* Bridge */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.StakingAndGovernance}`);
        }}
        isSelected={location.pathname === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemTextContainer>Bridge</MenuItemTextContainer>
      </MenuItem>

      {/* Staking */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.StakingAndGovernance}`);
        }}
        isSelected={location.pathname === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemTextContainer>Staking</MenuItemTextContainer>
      </MenuItem>

      {/* Governance */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.StakingAndGovernance}`);
        }}
        isSelected={location.pathname === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemTextContainer>Governance</MenuItemTextContainer>
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
  persistor?: Persistor;
  store?: AppStore;
  logout: () => void;
};
// top nav of the app, this is likely always visible.
function TopNavigation(props: TopNavigationProps): JSX.Element {
  const {
    isLightMode,
    logout,
    setIsLightMode,
    isLoggedIn = false,
    store,
  } = props;
  const navigate = useNavigate();

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
                forceLightMode={true}
              />
            </LogoContainer>
          )}
        </LeftSection>

        <MiddleSection>
          {/* <OnlyInMedium> */}
          {isLoggedIn && <TopNavigationMenuItems navigate={navigate} />}
          {/* </OnlyInMedium> */}
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
        {/* <OnlyInSmall>
          {isLoggedIn && <TopNavigationMenuItems navigate={navigate} />}
        </OnlyInSmall> */}
        {isLoggedIn && store && (
          <Provider store={store}>
            <TopNavigationLoggedIn
              isLightMode={isLightMode}
              setIsLightMode={(isLightMode) => setIsLightMode(isLightMode)}
            ></TopNavigationLoggedIn>
          </Provider>
        )}
        {!isLoggedIn && (
          <TopNavigationLogoContainer>
            <SettingsButton>
              <Icon iconName={IconName.Settings} />
            </SettingsButton>
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Home);
              }}
            >
              <Image
                imageName={ImageName.Logo}
                styleOverrides={{ maxWidth: "300px" }}
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
          </TopNavigationLogoContainer>
        )}
      </TopNavigationContainerSecondRow>
    </TopNavigationContainer>
  );
}

export default TopNavigation;
