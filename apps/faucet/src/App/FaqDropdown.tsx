import React, { useState } from "react";
import { FaqDropdownContainer, FaqDropdownContent, PlusIcon, DropDownTitle, DropDownTitleText } from "./Faq.components";
import plusIcon from '../../public/plus-icon.svg'

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
        <DropDownTitleText>
          {title}
        </DropDownTitleText>
        <PlusIcon src={plusIcon} isOpen={isOpen} />
      </DropDownTitle>

      <FaqDropdownContent isOpen={isOpen}>{children}</FaqDropdownContent>
       
    </FaqDropdownContainer>
  );
};
