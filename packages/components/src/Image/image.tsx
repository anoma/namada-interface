import { useContext, ComponentType } from "react";
import { ThemeContext } from "styled-components";

import { ImageName } from "./types";
import { ImageContainer, StyledImage } from "./image.components";

import { LogoDark } from "./assets/LogoDark";
import { LogoLight } from "./assets/LogoLight";
import { LogoMinimalDark } from "./assets/LogoMinimalDark";
import { LogoMinimalLight } from "./assets/LogoMinimalLight";
import { SuccessImage } from "./assets/SuccessImage";
import { LedgerLogo } from "./assets/LedgerLogo";

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
  [ImageName.SuccessImage]: SuccessImage,
  [ImageName.Ledger]: LedgerLogo,
};

// light theme images
const imagesLight: Record<ImageName, ComponentType> = {
  [ImageName.Logo]: LogoLight,
  [ImageName.LogoMinimal]: LogoMinimalLight,
  [ImageName.SuccessImage]: SuccessImage,
  [ImageName.Ledger]: LedgerLogo,
};

// gives the images based on color mode
const getImageByTypeAndMode = (
  imageName: ImageName,
  isLightMode: boolean
): ComponentType => {
  if (isLightMode) {
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
  const { isLightMode } = themeContext.themeConfigurations;
  const ImageByType = getImageByTypeAndMode(
    imageName,
    isLightMode || forceLightMode
  );

  return (
    <ImageContainer style={styleOverrides}>
      <StyledImage as={ImageByType} />
    </ImageContainer>
  );
};
