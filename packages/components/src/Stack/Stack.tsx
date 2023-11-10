import { Sizing } from "@namada/utils";
import { StackContainer } from "./Stack.components";

type StackProps<T extends keyof JSX.IntrinsicElements> = {
  children: React.ReactNode;
  gap: keyof Sizing;
  direction?: "vertical" | "horizontal";
  as?: T;
};

export enum GapPatterns {
  TitleContent = 8,
  FormFields = 5,
}

export const Stack = <T extends keyof JSX.IntrinsicElements>({
  children,
  gap = 4,
  direction = "vertical",
  ...props
}: StackProps<T> & React.ComponentPropsWithoutRef<T>): JSX.Element => {
  return (
    <StackContainer as={props.as} gap={gap} direction={direction} {...props}>
      {children}
    </StackContainer>
  );
};
