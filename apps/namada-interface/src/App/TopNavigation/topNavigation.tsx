import React, { useState } from "react";
import { Location, NavigateFunction, useNavigate } from "react-router-dom";

import { Icon, Image, Toggle } from "@namada/components";
import { useSanitizedLocation } from "@namada/hooks";
import { ColorMode } from "@namada/utils";
import {
  StakingAndGovernanceSubRoute,
  TopLevelRoute,
  locationToStakingAndGovernanceSubRoute,
  locationToTopLevelRoute,
} from "App/types";
import { AppStore } from "store/store";
import {
  ColorModeContainer,
  LeftSection,
  LogoContainer,
  MenuButton,
  MenuCloseButton,
  MenuItem,
  MenuItemSubComponent,
  MenuItemTextContainer,
  MiddleSection,
  MobileMenu,
  MobileMenuHeader,
  MobileMenuList,
  MobileMenuListItem,
  OnlyInMedium,
  OnlyInSmall,
  RightSection,
  TopNavigationContainer,
  TopNavigationContainerRow,
  TopNavigationContainerSecondRow,
} from "./topNavigation.components";
import TopNavigationLoggedIn from "./topNavigationLoggedIn";

/**
 * this is rendered in one of 2 places depending of the screen size
 */
const TopNavigationMenuItems = (
  props: {
    navigate: NavigateFunction;
    location: Location;
    setColorMode: (mode: ColorMode) => void;
  }
): React.ReactElement => {
  const { navigate } = props;
  const topLevelPath = `/${location.pathname.split("/")[1]}`;
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
          navigate(`${TopLevelRoute.Bridge}`);
        }}
        isSelected={location.pathname === TopLevelRoute.Bridge}
      >
        <MenuItemTextContainer>IBC</MenuItemTextContainer>
      </MenuItem>

      {/* Staking */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.StakingAndGovernance}`);
        }}
        isSelected={topLevelPath === TopLevelRoute.StakingAndGovernance}
      >
        <MenuItemTextContainer>Staking</MenuItemTextContainer>
      </MenuItem>

      {/* Governance */}
      <MenuItem
        onClick={() => {
          navigate(`${TopLevelRoute.Proposals}`);
        }}
        isSelected={topLevelPath === TopLevelRoute.Proposals}
      >
        <MenuItemTextContainer>Proposals</MenuItemTextContainer>
      </MenuItem>
    </>
  );
};

type TopNavigationProps = {
  // this is for the toggle
  colorMode: ColorMode;
  // cb for telling parent to change hte color in context
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
  store?: AppStore;
};

// top nav of the app, this is likely always visible.
function TopNavigation(props: TopNavigationProps): JSX.Element {
  const { colorMode, toggleColorMode, setColorMode, store } = props;
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const location = useSanitizedLocation();
  const topLevelRoute = locationToTopLevelRoute(location);
  const stakingAndGovernanceSubRoute =
    locationToStakingAndGovernanceSubRoute(location);

  return (
    <TopNavigationContainer>
      <OnlyInMedium>
        <TopNavigationContainerRow>
          <LeftSection>
            &nbsp;
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Wallet);
              }}
            >
              <Image
                imageName="Logo"
                styleOverrides={{ maxWidth: "200px" }}
                forceLightMode={true}
              />
            </LogoContainer>
          </LeftSection>

          <MiddleSection>
            <TopNavigationMenuItems
              location={location}
              navigate={navigate}
              setColorMode={setColorMode}
            />
          </MiddleSection>

          <RightSection>
            {store && (
              <>
                <TopNavigationLoggedIn
                  colorMode={colorMode}
                  toggleColorMode={toggleColorMode}
                ></TopNavigationLoggedIn>
              </>
            )}
          </RightSection>
        </TopNavigationContainerRow>
      </OnlyInMedium>

      {/* mobile size */}
      <OnlyInSmall>
        <TopNavigationContainerRow>
          &nbsp;
          <LeftSection>
            <MenuButton onClick={() => setShowMenu(true)}>
              <Icon name="Menu" />
            </MenuButton>
          </LeftSection>
          <MiddleSection>
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Wallet);
              }}
            >
              <Image imageName="Logo" styleOverrides={{ maxWidth: "200px" }} />
            </LogoContainer>
          </MiddleSection>
          <RightSection>
            <ColorModeContainer>
              {topLevelRoute !== TopLevelRoute.StakingAndGovernance && (
                <Toggle
                  checked={colorMode === "dark"}
                  onClick={toggleColorMode}
                />
              )}
            </ColorModeContainer>
          </RightSection>
        </TopNavigationContainerRow>
        <TopNavigationContainerSecondRow>
          {store && (
            <TopNavigationLoggedIn
              colorMode={colorMode}
              toggleColorMode={toggleColorMode}
            ></TopNavigationLoggedIn>
          )}
        </TopNavigationContainerSecondRow>
        <MobileMenu className={showMenu ? "active" : ""}>
          <MobileMenuHeader>
            <MenuCloseButton onClick={() => setShowMenu(false)}>
              <Icon name="ChevronLeft" />
            </MenuCloseButton>
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Wallet);
              }}
            >
              <Image imageName="Logo" styleOverrides={{ maxWidth: "200px" }} />
            </LogoContainer>
            <ColorModeContainer>
              {topLevelRoute !== TopLevelRoute.StakingAndGovernance && (
                <Toggle
                  checked={colorMode === "dark"}
                  onClick={toggleColorMode}
                />
              )}
            </ColorModeContainer>
          </MobileMenuHeader>

          <MobileMenuList>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Wallet);
                }}
                isSelected={topLevelRoute === TopLevelRoute.Wallet}
              >
                Wallet
              </MenuItem>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Bridge);
                }}
                isSelected={topLevelRoute === TopLevelRoute.Bridge}
              >
                IBC
              </MenuItem>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItemSubComponent
                onClick={() => {
                  setShowMenu(false);
                  navigate(
                    `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Staking}`
                  );
                }}
                isSelected={
                  stakingAndGovernanceSubRoute ===
                  StakingAndGovernanceSubRoute.Staking
                }
              >
                Staking
              </MenuItemSubComponent>
              <MenuItemSubComponent
                onClick={() => {
                  setShowMenu(false);
                  navigate(`${TopLevelRoute.Proposals}`);
                }}
                isSelected={topLevelRoute === TopLevelRoute.Proposals}
              >
                Governance
              </MenuItemSubComponent>
              <MenuItemSubComponent
                onClick={() => {
                  setShowMenu(false);
                  navigate(
                    `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.PublicGoodsFunding}`
                  );
                }}
                isSelected={
                  stakingAndGovernanceSubRoute ===
                  StakingAndGovernanceSubRoute.PublicGoodsFunding
                }
              >
                Public Goods Funding
              </MenuItemSubComponent>
            </MobileMenuListItem>
            <MobileMenuListItem>
              <MenuItem
                onClick={() => {
                  setShowMenu(false);
                  navigate(TopLevelRoute.Settings);
                }}
                isSelected={
                  topLevelRoute === TopLevelRoute.SettingsWalletSettings
                }
              >
                Settings
              </MenuItem>
            </MobileMenuListItem>
          </MobileMenuList>
        </MobileMenu>
      </OnlyInSmall>
    </TopNavigationContainer>
  );
}

export default TopNavigation;
