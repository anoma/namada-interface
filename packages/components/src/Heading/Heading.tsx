import { BaseHeading } from "./heading.components";
import { HeadingLevel } from "./types";

type HeadingProps = {
  level: HeadingLevel;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
};

export const Heading = (props: HeadingProps): JSX.Element => {
  const { level, children, onClick } = props;
  return (
    <BaseHeading onClick={onClick} as={level}>
      {children}
    </BaseHeading>
  );
};
