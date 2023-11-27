import { FontSize, ThemeColor } from "@namada/utils";
import { BaseHeading } from "./heading.components";
import { HeadingLevel } from "./types";

type HeadingProps = {
  level?: HeadingLevel;
  size?: keyof FontSize;
  themeColor?: ThemeColor;
  uppercase?: boolean;
  children: React.ReactNode;
  className?: string;
  textAlign?: "left" | "right" | "center";
};

export const Heading = ({
  level = "h1",
  size = "3xl",
  themeColor = "utility2",
  children,
  uppercase,
  className,
  textAlign = "center",
}: HeadingProps): JSX.Element => {
  return (
    <BaseHeading
      className={className}
      uppercase={uppercase}
      as={level}
      size={size}
      themeColor={themeColor}
      textAlign={textAlign}
    >
      {children}
    </BaseHeading>
  );
};
