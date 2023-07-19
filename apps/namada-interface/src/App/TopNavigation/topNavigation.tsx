import React, { useState, useContext } from "react";
import { ThemeContext } from "styled-components";
import {
  useNavigate,
  NavigateFunction,
  Location,
} from "react-router-dom";

import { ColorMode } from "@namada/utils";
import { chains } from "@namada/chains";
import { Chain } from "@namada/types";
import {
  Icon,
  IconName,
  Image,
  ImageName,
  Toggle,
  Select,
} from "@namada/components";
import { useSanitizedLocation } from "@namada/hooks";

import { useAppDispatch, useAppSelector } from "store";
import { AppStore } from "store/store";
import {
  TopLevelRoute,
  StakingAndGovernanceSubRoute,
  locationToTopLevelRoute,
  locationToStakingAndGovernanceSubRoute,
} from "App/types";
import {
  TopNavigationContainer,
  LeftSection,
  MiddleSection,
  RightSection,
  MenuItem,
  MenuItemForSecondRow,
  MenuItemSubComponent,
  MenuItemTextContainer,
  ColorModeContainer,
  LogoContainer,
  OnlyInSmall,
  OnlyInMedium,
  TopNavigationContainerRow,
  TopNavigationContainerSecondRow,
  TopNavigationSecondRowInnerContainer,
  MenuButton,
  MobileMenu,
  MobileMenuList,
  MobileMenuListItem,
  MobileMenuHeader,
  MenuCloseButton,
  SubMenuContainer,
} from "./topNavigation.components";
import { setChainId, SettingsState } from "slices/settings";
import TopNavigationLoggedIn from "./topNavigationLoggedIn";

/**
 * this is rendered in one of 2 places depending of the screen size
 */
const TopNavigationMenuItems = (props: {
  navigate: NavigateFunction;
  location: Location;
  setColorMode: (mode: ColorMode) => void;
}): React.ReactElement => {
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
        <MenuItemTextContainer>Bridge</MenuItemTextContainer>
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
          navigate(`${TopLevelRoute.Governance}`);
        }}
        isSelected={topLevelPath === TopLevelRoute.Governance}
      >
        <MenuItemTextContainer>Governance</MenuItemTextContainer>
      </MenuItem>
    </>
  );
};

type SecondMenuRowProps = {
  location: Location;
  navigate: NavigateFunction;
  toggleColorMode: () => void;
  setColorMode: (mode: ColorMode) => void;
};

const SecondMenuRow = (props: SecondMenuRowProps): React.ReactElement => {
  const dispatch = useAppDispatch();
  const { navigate, location } = props;
  const topLevelRoute = locationToTopLevelRoute(location);
  const stakingAndGovernanceSubRoute =
    locationToStakingAndGovernanceSubRoute(location);
  const isSubMenuContentVisible =
    topLevelRoute === TopLevelRoute.StakingAndGovernance;
  const { chainId } = useAppSelector<SettingsState>((state) => state.settings);

  // callback func for select component
  const handleNetworkSelect = (
    event: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    const { value } = event.target;
    dispatch(setChainId(value));
  };

  // transform for select component
  const networks = Object.values(chains).map(({ chainId, alias }: Chain) => ({
    label: alias,
    value: chainId,
  }));

  return (
    <TopNavigationSecondRowInnerContainer
      spaceBetween={isSubMenuContentVisible}
    >
      {isSubMenuContentVisible && (
        <SubMenuContainer>
          <MenuItemForSecondRow
            onClick={() => {
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
          </MenuItemForSecondRow>
          <MenuItemForSecondRow
            onClick={() => {
              navigate(
                `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Governance}`
              );
            }}
            isSelected={
              stakingAndGovernanceSubRoute ===
              StakingAndGovernanceSubRoute.Governance
            }
          >
            Governance
          </MenuItemForSecondRow>
          <MenuItemForSecondRow
            onClick={() => {
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
          </MenuItemForSecondRow>
        </SubMenuContainer>
      )}

      <RightSection>
        <Select
          value={chainId}
          data={networks}
          onChange={handleNetworkSelect}
        />
      </RightSection>
    </TopNavigationSecondRowInnerContainer>
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
  const themeContext = useContext(ThemeContext);
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
                navigate(TopLevelRoute.Home);
              }}
            >
              <Image
                imageName={ImageName.Logo}
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

        {/* sub menu */}
        <SecondMenuRow
          location={location}
          navigate={navigate}
          toggleColorMode={toggleColorMode}
          setColorMode={setColorMode}
        />
      </OnlyInMedium>

      {/* mobile size */}
      <OnlyInSmall>
        <TopNavigationContainerRow>
          &nbsp;
          <LeftSection>
            <MenuButton onClick={() => setShowMenu(true)}>
              <Icon
                iconName={IconName.Menu}
                strokeColorOverride={themeContext.colors.primary.main60}
                fillColorOverride={themeContext.colors.primary.main60}
              />
            </MenuButton>
          </LeftSection>
          <MiddleSection>
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Home);
              }}
            >
              <Image
                imageName={ImageName.Logo}
                styleOverrides={{ maxWidth: "200px" }}
              />
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
              <Icon
                iconName={IconName.ChevronLeft}
                strokeColorOverride={themeContext.colors.utility2.main60}
              />
            </MenuCloseButton>
            <LogoContainer
              onClick={() => {
                navigate(TopLevelRoute.Home);
              }}
            >
              <Image
                imageName={ImageName.Logo}
                styleOverrides={{ maxWidth: "200px" }}
              />
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
                  navigate(TopLevelRoute.Home);
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
                Bridge
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
                  navigate(
                    `${TopLevelRoute.StakingAndGovernance}${StakingAndGovernanceSubRoute.Governance}`
                  );
                }}
                isSelected={
                  stakingAndGovernanceSubRoute ===
                  StakingAndGovernanceSubRoute.Governance
                }
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
