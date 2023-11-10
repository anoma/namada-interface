import { FontSize, ThemeColor } from "@namada/utils";
import { BaseHeading } from "./heading.components";
import { HeadingLevel } from "./types";

type HeadingProps = {
  level?: HeadingLevel;
  size?: keyof FontSize;
  themeColor?: ThemeColor;
  uppercase?: boolean;
  children: React.ReactNode;
};

export const Heading = ({
  level = "h1",
  size = "3xl",
  themeColor = "utility2",
  children,
  uppercase,
}: HeadingProps): JSX.Element => {
  return (
    <BaseHeading
      uppercase={uppercase}
      as={level}
      size={size}
      themeColor={themeColor}
    >
      {children}
    </BaseHeading>
  );
};
