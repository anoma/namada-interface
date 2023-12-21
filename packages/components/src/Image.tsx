import { createElement } from "react";

import { LedgerLogo } from "./assets/LedgerLogo";
import { LogoDark } from "./assets/LogoDark";
import { LogoMinimalDark } from "./assets/LogoMinimalDark";
import { SuccessImage } from "./assets/SuccessImage";

// dark theme images
const imagesDark = {
  Logo: LogoDark,
  LogoMinimal: LogoMinimalDark,
  SuccessImage: SuccessImage,
  Ledger: LedgerLogo,
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
  const { imageName, styleOverrides = {} } = props;
  return (
    <div className="flex justify-center items-center" style={styleOverrides}>
      {createElement(imagesDark[imageName], {})}
    </div>
  );
};
