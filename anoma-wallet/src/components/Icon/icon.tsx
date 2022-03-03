import { ComponentType } from "react";
import { ReactComponent as HelpCircleDark } from "./assets/help-circle-dark.svg";
import { ReactComponent as MoonDark } from "./assets/moon-dark.svg";
import { ReactComponent as SunDark } from "./assets/sun-dark.svg";
import { ReactComponent as Key } from "./assets/key.svg";
import { ReactComponent as ChevronUp } from "./assets/chevron-up.svg";
import { ReactComponent as ChevronRight } from "./assets/chevron-right.svg";
import { ReactComponent as ChevronDown } from "./assets/chevron-down.svg";
import { ReactComponent as ChevronLeft } from "./assets/chevron-left.svg";

import { IconName, IconSize } from "./types";

import { IconContainer, StyledIcon } from "./icon.components";

export type ImageProps = {
  // Name of the icon, matching with the source files
  iconName: IconName;
  // S, M, L, if none passed the size is M
  iconSize?: IconSize;
  // override for the stroke line of the icon
  strokeColorOverride?: string;
  // for certain icons we might want to override the fill
  fillColorOverride?: string;
};

// dark theme icons
const icons: Record<IconName, ComponentType> = {
  [IconName.HelpCircle]: HelpCircleDark,
  [IconName.Moon]: MoonDark,
  [IconName.Sun]: SunDark,
  [IconName.Key]: Key,
  [IconName.ChevronUp]: ChevronUp,
  [IconName.ChevronRight]: ChevronRight,
  [IconName.ChevronDown]: ChevronDown,
  [IconName.ChevronLeft]: ChevronLeft,
};

/**
 * Icons are returned in the correct color based on the color scheme dark/light
 * stroke and fill colors can be overriden if need be, in addition the parent css
 * can style them
 */
export const Icon = (props: ImageProps): JSX.Element => {
  const {
    iconName,
    iconSize = IconSize.M,
    strokeColorOverride,
    fillColorOverride,
  } = props;
  const ImageByName = icons[iconName];
  return (
    <IconContainer>
      <StyledIcon
        as={ImageByName}
        $iconSize={iconSize}
        $strokeOverride={strokeColorOverride}
        $fillColorOverride={fillColorOverride}
      />
    </IconContainer>
  );
};
