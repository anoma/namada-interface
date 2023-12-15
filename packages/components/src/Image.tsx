import { ComponentType, useContext } from "react";
import { ThemeContext } from "styled-components";

import { LedgerLogo } from "./assets/LedgerLogo";
import { LogoDark } from "./assets/LogoDark";
import { LogoLight } from "./assets/LogoLight";
import { LogoMinimalDark } from "./assets/LogoMinimalDark";
import { LogoMinimalLight } from "./assets/LogoMinimalLight";
import { SuccessImage } from "./assets/SuccessImage";

// dark theme images
const imagesDark = {
  Logo: LogoDark,
  LogoMinimal: LogoMinimalDark,
  SuccessImage: SuccessImage,
  Ledger: LedgerLogo,
};

// light theme images
const imagesLight = {
  Logo: LogoLight,
  LogoMinimal: LogoMinimalLight,
  SuccessImage: SuccessImage,
  Ledger: LedgerLogo,
};

// gives the images based on color mode
const getImageByTypeAndMode = (
  imageName: keyof typeof imagesDark,
  isLightMode: boolean
): ComponentType => {
  if (isLightMode) {
    return imagesLight[imageName];
  }
  return imagesDark[imageName];
};

export interface ImageProps {
  imageName: keyof typeof imagesDark;
  styleOverrides?: React.CSSProperties;
  forceLightMode?: boolean;
}

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
    <div className="flex justify-center items-center" style={styleOverrides}>
      <ImageByType />
    </div>
  );
};
