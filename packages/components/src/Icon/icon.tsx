import { ComponentType } from "react";
import { ReactComponent as HelpCircleDark } from "./assets/help-circle-dark.svg";
import { ReactComponent as MoonDark } from "./assets/moon-dark.svg";
import { ReactComponent as SunDark } from "./assets/sun-dark.svg";
import { ReactComponent as Key } from "./assets/key.svg";
import { ReactComponent as Camera } from "./assets/camera.svg";
import { ReactComponent as ChevronUp } from "./assets/chevron-up.svg";
import { ReactComponent as ChevronRight } from "./assets/chevron-right.svg";
import { ReactComponent as ChevronDown } from "./assets/chevron-down.svg";
import { ReactComponent as ChevronLeft } from "./assets/chevron-left.svg";
import { ReactComponent as EyeDark } from "./assets/eye-dark.svg";
import { ReactComponent as EyeHiddenDark } from "./assets/eye-hidden-dark.svg";
import { ReactComponent as ThumbsUp } from "./assets/thumbs-up.svg";
import { ReactComponent as Briefcase } from "./assets/briefcase.svg";
import { ReactComponent as Settings } from "./assets/settings.svg";
import { ReactComponent as PlusCircle } from "./assets/plus-circle.svg";
import { ReactComponent as Info } from "./assets/info.svg";
import { ReactComponent as Lock } from "./assets/lock.svg";
import { ReactComponent as Menu } from "./assets/menu.svg";
import { ReactComponent as Copy } from "./assets/copy.svg";
import { ReactComponent as Warning } from "./assets/warning.svg";
import { ReactComponent as ArrowLeft } from "./assets/arrow-left.svg";
import { ReactComponent as Checked } from "./assets/checked.svg";
import { ReactComponent as ThreeDotsVertical } from "./assets/three-dots-vertical.svg";
import { ReactComponent as Discord } from "./assets/discord.svg";
import { ReactComponent as TwitterX } from "./assets/twitter.svg";
import { ReactComponent as QuestionMark } from "./assets/question.svg";

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
  // to wrap Icon in styled component
  className?: string;
};

// dark theme icons
const icons: Record<IconName, ComponentType> = {
  [IconName.HelpCircle]: HelpCircleDark,
  [IconName.Moon]: MoonDark,
  [IconName.Sun]: SunDark,
  [IconName.Key]: Key,
  [IconName.Camera]: Camera,
  [IconName.ChevronUp]: ChevronUp,
  [IconName.ChevronRight]: ChevronRight,
  [IconName.ChevronDown]: ChevronDown,
  [IconName.ChevronLeft]: ChevronLeft,
  [IconName.ArrowLeft]: ArrowLeft,
  [IconName.Eye]: EyeDark,
  [IconName.EyeHidden]: EyeHiddenDark,
  [IconName.ThumbsUp]: ThumbsUp,
  [IconName.Briefcase]: Briefcase,
  [IconName.Settings]: Settings,
  [IconName.Plus]: PlusCircle,
  [IconName.Info]: Info,
  [IconName.Lock]: Lock,
  [IconName.Menu]: Menu,
  [IconName.Copy]: Copy,
  [IconName.Warning]: Warning,
  [IconName.Checked]: Checked,
  [IconName.ThreeDotsVertical]: ThreeDotsVertical,
  [IconName.Discord]: Discord,
  [IconName.TwitterX]: TwitterX,
  [IconName.QuestionMark]: QuestionMark,
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
    className,
  } = props;
  const ImageByName = icons[iconName];
  return (
    <IconContainer className={className}>
      <StyledIcon
        as={ImageByName}
        $iconSize={iconSize}
        $strokeOverride={strokeColorOverride}
        $fillColorOverride={fillColorOverride}
      />
    </IconContainer>
  );
};
