import { FontSize } from "@namada/utils";
import { BaseHeading } from "./heading.components";
import { HeadingLevel } from "./types";

type HeadingProps = {
  level?: HeadingLevel;
  size?: keyof FontSize;
  children: React.ReactNode;
};

export const Heading = ({
  level = "h1",
  size = "3xl",
  children,
}: HeadingProps): JSX.Element => {
  return (
    <BaseHeading as={level} size={size}>
      {children}
    </BaseHeading>
  );
};
