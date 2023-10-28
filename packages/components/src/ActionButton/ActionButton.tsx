import { ButtonContainer, ButtonVariants } from "./ActionButton.components";

type ActionButtonProps<HtmlTag extends keyof JSX.IntrinsicElements> = {
  as?: HtmlTag;
  variant?: ButtonVariants;
} & React.ComponentPropsWithoutRef<HtmlTag>;

export const ActionButton = ({
  children,
  variant = "primary",
  as = "button",
  ...props
}: ActionButtonProps<keyof JSX.IntrinsicElements>): JSX.Element => {
  return (
    <ButtonContainer variant={variant} as={as} {...props}>
      {children}
    </ButtonContainer>
  );
};
