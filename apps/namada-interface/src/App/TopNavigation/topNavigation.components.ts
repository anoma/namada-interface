import styled, { css, FlattenSimpleInterpolation } from "styled-components";
import { ColorMode, DesignConfiguration } from "@namada/utils";

enum ComponentColor {
  Logo,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const { colorMode } = theme.themeConfigurations;

  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
    light: {
      [ComponentColor.Logo]: theme.colors.utility2.main,
    },
    dark: {
      [ComponentColor.Logo]: theme.colors.primary.main,
    },
  };

  return colorMap[colorMode][color];
};

export const TopNavigationContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 120px;
  padding: 40px 0;
  box-sizing: border-box;

  @media screen and (min-width: 860px) {
    padding: 40px;
  }
`;

export const TopNavigationContainerRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

export const TopNavigationContainerSecondRow = styled(
  TopNavigationContainerRow
)`
  justify-content: center;
`;

export const TopNavigationSecondRowInnerContainer = styled(
  TopNavigationContainerRow
)<{ spaceBetween?: boolean }>`
  justify-content: ${(props) =>
    props.spaceBetween ? "space-between" : "flex-end"};
  min-height: 48px;
  width: 100%;
  max-width: 760px;
  margin-top: 24px;
`;

export const TopNavigationLogoContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 760px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const Section = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const LeftSection = styled(Section)`
  justify-content: start;
  width: 25%;
`;

export const MiddleSection = styled(Section)`
  justify-content: center;
  width: 60%;
`;

export const SubMenuContainer = styled(Section)`
  justify-content: center;
`;

export const RightSection = styled(Section)`
  justify-content: end;
  width: 25%;
`;

const isSelected = (colorInHex: string): FlattenSimpleInterpolation => {
  return css`
    color: ${colorInHex};
    transition: font-weight 0.1s ease-out, stroke-width 0.1s ease-out;
    font-weight: 700;
    & path {
      stroke-width: 2;
    }
  `;
};

export const MenuItem = styled.button<{ isSelected?: boolean }>`
  all: unset;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 22px;
  font-size: 14px;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.utility2.main80};

  @media screen and (max-width: 860px) {
    padding: 40px 0;
    height: 100%;
    justify-content: flex-start;
  }

  &:last-child {
    margin-right: 0;
  }

  & path {
    fill: ${(props) => props.theme.colors.utility2.main60};
  }

  ${(props) =>
    props.isSelected ? isSelected(props.theme.colors.utility2.main) : ""}
`;

export const MenuItemForSecondRow = styled(MenuItem)`
  margin-right: 32px;
  margin-left: 0px;
`;

export const MenuItemSubComponent = styled(MenuItem)`
  margin: 0 22px 0 48px;
  @media screen and (max-width: 860px) {
    padding: 16px 0;
    height: 100%;
    justify-content: flex-start;
  }
`;

export const MenuItemTextContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 0 4px;
  &:last-child {
    margin-right: 0;
    padding-right: 0;
  }
`;

export const MenuItemIconContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
`;

export const ColorModeContainer = styled.div`
  display: flex;
  justify-content: end;
  align-items: center;
`;

export const LogoContainer = styled.div`
  cursor: pointer;

  & > div {
    svg > path {
      stroke: none;
      fill: ${(props) => getColor(ComponentColor.Logo, props.theme)};
    }
  }
`;

export const MenuButton = styled.button`
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;

  & div {
    svg > path {
      stroke: ${(props) => getColor(ComponentColor.Logo, props.theme)};
      fill: ${(props) => getColor(ComponentColor.Logo, props.theme)};
    }
  }
`;

export const MenuCloseButton = styled.button`
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;

  & div {
    svg > path {
      stroke: ${(props) => getColor(ComponentColor.Logo, props.theme)};
    }
  }
`;

export const OnlyInSmall = styled.div`
  display: flex;
  flex-direction: column;

  @media only screen and (min-width: 860px) {
    display: none;
  }
`;

export const OnlyInMedium = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  @media only screen and (max-width: 860px) {
    display: none;
  }
`;

export const MobileMenu = styled.div`
  display: none;

  z-index: 2000;
  margin: 0;
  box-sizing: border-box;
  padding: 48px 40px;

  &.active {
    display: flex;
    flex-direction: column;
    background: ${(props) => props.theme.colors.utility1.main80};
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
  }
`;

export const MobileMenuHeader = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;

  & div {
    svg > path {
      stroke: ${(props) => getColor(ComponentColor.Logo, props.theme)};
    }
  }

  & div:nth-child(2) {
    svg > path {
      stroke: ${(props) => props.theme.colors.utility2.main};
      fill: ${(props) => props.theme.colors.utility2.main};
    }
  }
`;

export const MobileMenuList = styled.ul`
  height: 100%;
  width: 100%;
  list-style-type: none;
  text-indent: 0;
  padding: 0;
  margin: 0;
  overflow-y: auto;
`;

export const MobileMenuListItem = styled.li`
  padding: 0;
  margin: 0;
  border-bottom: 1px solid ${(props) => props.theme.colors.utility2.main60};
  color: ${(props) => props.theme.colors.utility2.main80};

  & button {
    width: 100%;
  }

  & button > div {
    color: ${(props) => props.theme.colors.utility2.main80};
    & > svg > path {
      fill: ${(props) => props.theme.colors.utility2.main80};
    }
  }
`;
