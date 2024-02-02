import clsx from "clsx";
import { tv, type VariantProps } from "tailwind-variants";
import { ArrowLeft } from "./assets/ArrowLeft";
import { Briefcase } from "./assets/Briefcase";
import { Camera } from "./assets/Camera";
import { Checked } from "./assets/Checked";
import { ChevronDown } from "./assets/ChevronDown";
import { ChevronLeft } from "./assets/ChevronLeft";
import { ChevronRight } from "./assets/ChevronRight";
import { ChevronUp } from "./assets/ChevronUp";
import { Close } from "./assets/Close";
import { Copy } from "./assets/Copy";
import { Discord } from "./assets/Discord";
import { Eye } from "./assets/Eye";
import { EyeHidden } from "./assets/EyeHidden";
import { HelpCircle } from "./assets/HelpCircle";
import { Info } from "./assets/Info";
import { Key } from "./assets/Key";
import { Lock } from "./assets/Lock";
import { Menu } from "./assets/Menu";
import { Moon } from "./assets/Moon";
import { PlusCircle } from "./assets/PlusCircle";
import { QuestionMark } from "./assets/QuestionMark";
import { Settings } from "./assets/Settings";
import { Sun } from "./assets/Sun";
import { ThreeDotsVertical } from "./assets/ThreeDotsVertical";
import { ThumbsUp } from "./assets/ThumbsUp";
import { TwitterX } from "./assets/TwitterX";
import { Warning } from "./assets/Warning";
import { X } from "./assets/X";

export const icons = {
  HelpCircle,
  Moon,
  Sun,
  Key,
  Camera,
  ChevronUp,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ArrowLeft,
  Eye,
  EyeHidden,
  ThumbsUp,
  Briefcase,
  Settings,
  PlusCircle,
  Info,
  Lock,
  Menu,
  Copy,
  Warning,
  X,
  Checked,
  ThreeDotsVertical,
  Discord,
  TwitterX,
  QuestionMark,
  Close,
};

const iconClasses = tv({
  base: clsx("inline-flex items-center justify-center max-w-full max-h-full"),
  variants: {
    size: {
      sm: "w-4",
      md: "w-6",
      lg: "w-9",
      full: "w-full [&_svg]:w-full",
    },
    fill: {
      true: "[&_path]:fill-current [&_rect]:fill-current [&_circle]:fill-current",
    },
    stroke: {
      true: "[&_path]:stroke-current [&_rect]:stroke-current [&_circle]:stroke-current",
    },
  },
  defaultVariants: {
    size: "md",
    stroke: true,
    fill: false,
  },
});

export type IconProps = {
  name: keyof typeof icons;
  fill?: boolean;
  stroke?: boolean;
  className?: string;
} & VariantProps<typeof iconClasses>;

export const Icon = ({
  name,
  size,
  fill,
  stroke,
  className,
}: IconProps): JSX.Element => {
  const ImageByName = icons[name];
  return (
    <i className={iconClasses({ size, fill, stroke, class: className })}>
      <ImageByName />
    </i>
  );
};
