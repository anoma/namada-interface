import { ComponentType, useContext } from "react";
import { ThemeContext } from "styled-components/macro";

import { ReactComponent as LogoDark } from "./assets/logo-dark.svg";
import { ReactComponent as LogoLight } from "./assets/logo-light.svg";
import { ReactComponent as LogoMinimalDark } from "./assets/logo-minimal-dark.svg";
import { ReactComponent as LogoMinimalLight } from "./assets/logo-minimal-light.svg";
import { ReactComponent as SuccessImageDark } from "./assets/success-image.svg";
import { ReactComponent as SuccessImageLight } from "./assets/success-image.svg";

import { ImageName } from "./types";
import { ImageContainer, StyledImage } from "./image.components";
import { ColorMode } from "utils/theme";

export interface ImageProps {
  imageName: ImageName;
  // free css overrides
  styleOverrides?: React.CSSProperties;
  forceLightMode?: boolean;
}

// dark theme images
const imagesDark: Record<ImageName, ComponentType> = {
  [ImageName.Logo]: LogoDark,
  [ImageName.LogoMinimal]: LogoMinimalDark,
  [ImageName.SuccessImage]: SuccessImageDark,
};

// light theme images
const imagesLight: Record<ImageName, ComponentType> = {
  [ImageName.Logo]: LogoLight,
  [ImageName.LogoMinimal]: LogoMinimalLight,
  [ImageName.SuccessImage]: SuccessImageLight,
};

// gives the images based on color mode
const getImageByTypeAndMode = (
  imageName: ImageName,
  colorMode: ColorMode,
  forceLightMode: boolean
): ComponentType => {
  if (colorMode === "light" || forceLightMode) {
    return imagesLight[imageName];
  }
  return imagesDark[imageName];
};

/**
 * Image is very similar to Icon component, but I think its still justified to have
 * it separately as it:
 * 1. unlikely need any color overriding from consumer.
 * 2. Is not styled based on color mode
 * 3. might need more free size overriding.
 */
export const Image = (props: ImageProps): JSX.Element => {
  const { imageName, styleOverrides = {}, forceLightMode = false } = props;
  const themeContext = useContext(ThemeContext);
  const { colorMode } = themeContext.themeConfigurations;
  const ImageByType = getImageByTypeAndMode(
    imageName,
    colorMode,
    forceLightMode
  );

  return (
    <ImageContainer style={styleOverrides}>
      <StyledImage as={ImageByType} />
    </ImageContainer>
  );
};
