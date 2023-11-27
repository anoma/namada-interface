import { ThemeColor } from "@namada/utils";
import {
  AccordionContainer,
  AccordionContentContainer,
  AccordionTitle,
  AccordionTitleChevron,
  AccordionTitleContainer,
} from "./Accordion.components";
import { IconName } from "../Icon";
import { useState } from "react";

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
        onClick={() => {
          setOpened(!opened);
        }}
      >
        <AccordionTitle>{title}</AccordionTitle>
        <AccordionTitleChevron
          iconName={opened ? IconName.ChevronUp : IconName.ChevronDown}
        />
      </AccordionTitleContainer>
      {opened && (
        <AccordionContentContainer>{children}</AccordionContentContainer>
      )}
    </AccordionContainer>
  );
};
