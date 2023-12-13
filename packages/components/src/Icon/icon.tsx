import { ComponentType } from "react";
import { HelpCircleDark } from "./assets/HelpCircleDark";
import { MoonDark } from "./assets/MoonDark";
import { SunDark } from "./assets/SunDark";
import { Key } from "./assets/Key";
import { Camera } from "./assets/Camera";
import { ChevronUp } from "./assets/ChevronUp";
import { ChevronRight } from "./assets/ChevronRight";
import { ChevronDown } from "./assets/ChevronDown";
import { ChevronLeft } from "./assets/ChevronLeft";
import { EyeDark } from "./assets/EyeDark";
import { EyeHiddenDark } from "./assets/EyeHiddenDark";
import { ThumbsUp } from "./assets/ThumbsUp";
import { Briefcase } from "./assets/Briefcase";
import { Settings } from "./assets/Settings";
import { PlusCircle } from "./assets/PlusCircle";
import { Info } from "./assets/Info";
import { Lock } from "./assets/Lock";
import { Menu } from "./assets/Menu";
import { Copy } from "./assets/Copy";
import { Warning } from "./assets/Warning";
import { ArrowLeft } from "./assets/ArrowLeft";
import { Checked } from "./assets/Checked";
import { ThreeDotsVertical } from "./assets/ThreeDotsVertical";
import { Discord } from "./assets/Discord";
import { TwitterX } from "./assets/TwitterX";
import { QuestionMark } from "./assets/QuestionMark";
import { Close } from "./assets/Close";

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
  [IconName.Close]: Close,
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
