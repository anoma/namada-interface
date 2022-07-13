import styled, {
  css,
  FlattenSimpleInterpolation,
} from "styled-components/macro";

export const TopNavigationContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 120px;
  padding: 32px 32px 0;
  box-sizing: border-box;
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
  width: 50%;
`;

export const RightSection = styled(Section)`
  justify-content: end;
  width: 35%;
`;

const isSelected = (): FlattenSimpleInterpolation => {
  return css`
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
  margin: 0 16px;
  & path {
    stroke-width: 1;
  }
  //width: 10%;
  ${(props) => (props.isSelected ? isSelected() : "")}
`;

export const MenuItemTextContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 16px;
  color: ${(props) => props.theme.colors.textPrimary};
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
`;

export const OnlyInSmall = styled.div`
  display: flex;
  @media only screen and (min-width: 1024px) {
    display: none;
  }
`;
export const OnlyInMedium = styled.div`
  display: flex;
  @media only screen and (max-width: 1024px) {
    display: none;
  }
`;
