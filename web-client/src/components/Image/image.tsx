import { useContext } from "react";
import { ThemeContext } from "styled-components";

import { ReactComponent as LogoDark } from "./assets/logo-dark.svg";
import { ReactComponent as LogoLight } from "./assets/logo-light.svg";
import { ReactComponent as LogoMinimalDark } from "./assets/logo-minimal-dark.svg";
import { ReactComponent as LogoMinimalLight } from "./assets/logo-minimal-light.svg";
import { ImageName } from "./types";
import { ComponentType } from "react";
import { ImageContainer, StyledImage } from "./styledComponents";

export interface ImageProps {
  imageName: ImageName;
  styleOverrides?: React.CSSProperties;
  dataTestId?: string;
}

// this would be nice and I thought that it should work, but it doesn't
// type Images = {
//   [key in `${ImageName.Logo}_${ColorMode.Dark}`]: ComponentType;
// };
// const images: Images = {
//   [`${ImageName.Logo}_${ColorMode.Dark}`]: LogoDark,
//   [`${ImageName.Logo}_${ColorMode.Light}`]: LogoLight,
//   [`${ImageName.LogoMinimal}_${ColorMode.Dark}`]: LogoDark,
//   [`${ImageName.LogoMinimal}_${ColorMode.Light}`]: LogoLight,
// };
//
// or just
//
// const images: Record<`${ImageName}_${ColorMode}`, ComponentType> = {
//   [`${ImageName.Logo}_${ColorMode.Dark}`]: LogoDark,
//   [`${ImageName.Logo}_${ColorMode.Light}`]: LogoLight,
//   [`${ImageName.LogoMinimal}_${ColorMode.Dark}`]: LogoDark,
//   [`${ImageName.LogoMinimal}_${ColorMode.Light}`]: LogoLight,
// };

// dark theme images
const imagesDark: Record<ImageName, ComponentType> = {
  [ImageName.Logo]: LogoDark,
  [ImageName.LogoMinimal]: LogoMinimalDark,
};

// light theme images
const imagesLight: Record<ImageName, ComponentType> = {
  [ImageName.Logo]: LogoLight,
  [ImageName.LogoMinimal]: LogoMinimalLight,
};

const getImageByTypeAndMode = (imageName: ImageName, isLightMode: boolean) => {
  if (isLightMode) {
    return imagesLight[imageName];
  }
  return imagesDark[imageName];
};

export const Image = (props: ImageProps) => {
  const { imageName, dataTestId, styleOverrides = {} } = props;
  const themeContext = useContext(ThemeContext);
  const { isLightMode } = themeContext.themeConfigurations;
  const ImageByType = getImageByTypeAndMode(imageName, isLightMode);

  return (
    <ImageContainer style={styleOverrides}>
      <StyledImage as={ImageByType} data-testid={dataTestId} />
    </ImageContainer>
  );
};
