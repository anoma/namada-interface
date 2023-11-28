import { FontSize, ThemeColor } from "@namada/utils";
import { BaseHeading } from "./heading.components";
import { HeadingLevel } from "./types";
import { FontWeight, TextAlignment } from "../types";

type HeadingProps = {
  level?: HeadingLevel;
  size?: keyof FontSize;
  themeColor?: ThemeColor;
  uppercase?: boolean;
  children: React.ReactNode;
  className?: string;
  textAlign?: TextAlignment;
  fontWeight?: FontWeight;
};

export const Heading = ({
  level = "h1",
  size = "3xl",
  themeColor = "utility2",
  children,
  uppercase,
  className,
  textAlign = "center",
  fontWeight = "500",
}: HeadingProps): JSX.Element => {
  return (
    <BaseHeading
      className={className}
      uppercase={uppercase}
      as={level}
      size={size}
      themeColor={themeColor}
      textAlign={textAlign}
      fontWeight={fontWeight}
    >
      {children}
    </BaseHeading>
  );
};
