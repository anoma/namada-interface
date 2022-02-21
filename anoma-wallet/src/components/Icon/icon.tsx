import React from "react";
import { ReactComponent as HelpCircleDark } from "./assets/help-circle-dark.svg";
import { ReactComponent as MoonDark } from "./assets/moon-dark.svg";
import { ReactComponent as SunDark } from "./assets/sun-dark.svg";

import { IconName } from "./types";
import { ComponentType } from "react";
import { IconContainer, StyledIcon } from "./styledComponents";

export type ImageProps = {
  iconName: IconName;
  strokeColor?: string;
  fillColor?: string;
  dataTestId?: string;
};

// dark theme icons
const icons: Record<IconName, ComponentType> = {
  [IconName.HelpCircle]: HelpCircleDark,
  [IconName.Moon]: MoonDark,
  [IconName.Sun]: SunDark,
};

export const Icon = (props: ImageProps) => {
  const { iconName, dataTestId, strokeColor, fillColor } = props;
  const ImageByName = icons[iconName];
  return (
    <IconContainer>
      <StyledIcon
        as={ImageByName}
        data-testid={dataTestId}
        strokeColor={strokeColor}
        fillColor={fillColor}
      />
    </IconContainer>
  );
};
