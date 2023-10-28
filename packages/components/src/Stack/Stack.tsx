import { Sizing } from "@namada/utils";
import { StackContainer } from "./Stack.components";

type StackProps = {
  children: React.ReactNode;
  gap: keyof Sizing;
  direction?: "vertical" | "horizontal";
  as?: keyof JSX.IntrinsicElements;
};

export const Stack = ({
  as = "ul",
  children,
  gap = 4,
  direction = "vertical",
}: StackProps): JSX.Element => {
  return (
    <StackContainer as={as} gap={gap} direction={direction}>
      {children}
    </StackContainer>
  );
};
