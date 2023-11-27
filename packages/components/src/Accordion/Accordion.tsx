import { Icon, IconName, IconSize } from "@namada/components";
import { ThemeColor } from "@namada/utils";
import { useState } from "react";
import {
  AccordionContainer,
  AccordionContentContainer,
  AccordionTitle,
  AccordionTitleContainer,
  AccordionTitleIndicator,
} from "./Accordion.components";

type AccordionProps<HtmlTag extends keyof JSX.IntrinsicElements> = {
  as?: HtmlTag;
  title: string | JSX.Element;
  variant?: ThemeColor;
  solid?: boolean;
} & React.ComponentPropsWithoutRef<HtmlTag>;

export const Accordion = ({
  title,
  children,
  variant = "primary",
  as = "div",
  solid = false,
  ...props
}: AccordionProps<keyof JSX.IntrinsicElements>): JSX.Element => {
  const [opened, setOpened] = useState(false);

  return (
    <AccordionContainer solid={solid} variant={variant} as={as} {...props}>
      <AccordionTitleContainer
        hoverColor="primary"
        onClick={() => {
          setOpened(!opened);
        }}
      >
        <AccordionTitle>{title}</AccordionTitle>
        <AccordionTitleIndicator open={opened}>
          <Icon
            strokeColorOverride="currentColor"
            iconName={IconName.ChevronDown}
            iconSize={IconSize.S}
          />
        </AccordionTitleIndicator>
      </AccordionTitleContainer>
      {opened && (
        <AccordionContentContainer>{children}</AccordionContentContainer>
      )}
    </AccordionContainer>
  );
};
