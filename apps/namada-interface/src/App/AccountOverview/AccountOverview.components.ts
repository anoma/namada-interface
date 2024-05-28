import { ColorMode, DesignConfiguration } from "@namada/utils";
import styled from "styled-components";

enum ComponentColor {
  TabLabelActive,
  BackgroundActive,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const { colorMode } = theme.themeConfigurations;

  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
    light: {
      [ComponentColor.TabLabelActive]: theme.colors.secondary.main,
      [ComponentColor.BackgroundActive]: theme.colors.utility3.white,
    },
    dark: {
      [ComponentColor.TabLabelActive]: theme.colors.primary.main,
      [ComponentColor.BackgroundActive]: theme.colors.utility1.main80,
    },
  };

  return colorMap[colorMode][color];
};

export const AccountOverviewContainer = styled.div`
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 24px 0 0 0;
  h1 {
    margin: 0;
  }

  h4 {
    margin: 12px 0;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: ${(props) => props.theme.colors.utility2.main};
  }
`;

export const AccountOverviewContent = styled.div`
  width: 100%;
  padding: 0 40px;
  box-sizing: border-box;
  background-color: ${(props) =>
    getColor(ComponentColor.BackgroundActive, props.theme)};
`;

export const InputContainer = styled.div`
  width: 100%;
  justify-content: baseline;
  padding: 20px;
  color: ${(props) => props.theme.colors.utility2.main80};
  box-sizing: border-box;
  input {
    width: 96%;
  }

  pre {
    background-color: ${(props) => props.theme.colors.utility1.main70};
  }
`;

export const TotalContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeadingContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 8px;

  h4 {
    font-size: 20px;
    margin-bottom: 0;
  }
`;

export const TotalHeading = styled.div`
  text-align: left;

  h1 {
    font-size: 30px;
  }
`;

export const TotalAmount = styled.div`
  display: flex;
  align-items: flex-end;
  font-size: 50px;
  font-weight: bold;
  padding: 0;
  text-align: right;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const TotalAmountValue = styled.span`
  margin-bottom: -10px;
`;

export const TotalAmountFiat = styled.span`
  font-size: 20px;
  padding-right: 10px;
`;

export const NoAccountsContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  margin: 0;
  padding: 20px 0;
  color: ${(props) => props.theme.colors.utility2.main80};
`;
