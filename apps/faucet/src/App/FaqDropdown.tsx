import React, { useState } from "react";
import { FaqDropdownContainer, FaqDropdownContent } from "./Faq.components";
import { Text } from "@namada/components";

type Props = {
  title: string;
  children: React.ReactNode;
};
export const FaqDropdown: React.FC<Props> = ({ children, title }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const onExpand = (): void => {
    setIsExpanded(true);
  };

  const onCollapse = (): void => {
    setIsExpanded(false);
  };

  return (
    <FaqDropdownContainer onClick={isExpanded ? onCollapse : onExpand}>
      <Text themeColor="utility1" fontSize="2xl">
        {title}
      </Text>

      <FaqDropdownContent isOpen={isExpanded}>{children}</FaqDropdownContent>
    </FaqDropdownContainer>
  );
};
