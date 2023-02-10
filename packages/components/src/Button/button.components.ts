import styled from "styled-components";
import { DesignConfiguration, ColorMode } from "@anoma/utils";

enum ComponentColor {
  ButtonBackground,
  ContainedButtonLabelColor,
}

const getColor = (
  color: ComponentColor,
  theme: DesignConfiguration
): string => {
  const { colorMode } = theme.themeConfigurations;

  const colorMap: Record<ColorMode, Record<ComponentColor, string>> = {
    light: {
      [ComponentColor.ButtonBackground]: theme.colors.secondary.main,
      [ComponentColor.ContainedButtonLabelColor]: theme.colors.utility3.black,
    },
    dark: {
      [ComponentColor.ButtonBackground]: theme.colors.primary.main,
      [ComponentColor.ContainedButtonLabelColor]: theme.colors.utility3.black,
    },
  };

  return colorMap[colorMode][color];
};

export const ButtonContent = styled.span``;

const Button = styled.button`
  position: relative;
  padding: 0.75em 1.25em;
  margin: 0.5em 1.25em;
  font-size: 1em;
  border-style: solid;
  text-align: center;
  font-weight: 500;
  font-family: "Space Grotesk", sans-serif;
  cursor: pointer;
  & ${ButtonContent} {
    transition: opacity 0.3s;
    opacity: 1;
  }

  &.loading ${ButtonContent} {
    pointer-events: none;
    opacity: 0;
  }

  &::after {
    content: "";
    opacity: 0;
    transition: opacity 0.3s;
    position: absolute;
    width: 16px;
    height: 16px;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    border: 4px solid transparent;
    border-top-color: ${(props) => props.theme.colors.utility3.black};
    border-radius: 50%;
    animation: button-loading-spinner 1s ease infinite;

    @keyframes button-loading-spinner {
      from {
        transform: rotate(0turn);
      }

      to {
        transform: rotate(1turn);
      }
    }
  }

  &.loading::after {
    opacity: 1;
  }
`;

const RoundButton = styled(Button)`
  border-radius: ${(props) => props.theme.borderRadius.buttonBorderRadius};
  border: none;
`;

export const OutlinedButton = styled(RoundButton)`
  border-color: ${(props) => props.theme.colors.primary.main60};
  background-color: ${(props) => props.theme.colors.utility1.main80};
  color: ${(props) => props.theme.colors.utility1.main80};

  &:hover {
    border-color: ${(props) => props.theme.colors.primary.main80};
  }
  &:disabled {
    opacity: 30%;
    cursor: initial;
    border-color: ${(props) => props.theme.colors.primary.main80};
  }

  &.active {
    background-color: ${(props) => props.theme.colors.primary.main};
    color: ${(props) => props.theme.colors.utility2.main80};
  }
`;

export const ContainedButton = styled(RoundButton)`
  background-color: ${(props) => props.theme.colors.primary.main};
  background-color: ${(props) =>
    getColor(ComponentColor.ButtonBackground, props.theme)};
  color: ${(props) =>
    getColor(ComponentColor.ContainedButtonLabelColor, props.theme)};
  &:disabled {
    opacity: 50%;
    cursor: initial;
  }
`;

export const ContainedAltButton = styled(RoundButton)`
  border-color: ${(props) => props.theme.colors.primary.main60};
  background-color: ${(props) => props.theme.colors.primary.main80};
  color: ${(props) => props.theme.colors.utility1.main80};
  &:hover {
    border-color: ${(props) => props.theme.colors.primary.main60};
  }
  &:disabled {
    opacity: 30%;
    cursor: initial;
    border-color: ${(props) => props.theme.colors.primary.main60};
  }
`;

export const SmallButton = styled(Button)`
  border-width: 1px;
  border-radius: 4px;
  background-color: transparent;
  border-color: ${(props) => props.theme.colors.primary.main60};
  color: ${(props) => props.theme.colors.utility2.main60};
  &:active {
    background-color: ${(props) => props.theme.colors.primary.main60};
    color: white;
  }
  &:disabled {
    opacity: 30%;
    cursor: initial;
    background-color: transparent;
  }
`;
