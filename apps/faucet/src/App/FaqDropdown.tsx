import React, { useState } from "react";
import plusIcon from "../../public/plus-icon.svg";
import {
  DropDownTitle,
  DropDownTitleText,
  FaqDropdownContainer,
  FaqDropdownContent,
  PlusIcon,
} from "./Faq.components";

type Props = {
  title: string;
  children: React.ReactNode;
};
export const FaqDropdown: React.FC<Props> = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState<boolean | null>(null);

  const handleToggle = (): void => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <FaqDropdownContainer onClick={handleToggle}>
      <DropDownTitle>
        <DropDownTitleText>{title}</DropDownTitleText>
        <PlusIcon src={plusIcon} isOpen={isOpen} />
      </DropDownTitle>

      <FaqDropdownContent isOpen={isOpen}>{children}</FaqDropdownContent>
    </FaqDropdownContainer>
  );
};
