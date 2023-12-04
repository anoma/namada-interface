import React, { useState, useEffect } from "react";
import { FaqDropdownContainer, FaqDropdownContent, PlusIcon, DropDownTitle, DropDownTitleText } from "./Faq.components";
import plusIcon from '../../public/plus-icon.svg'

type Props = {
  title: string;
  children: React.ReactNode;
};
export const FaqDropdown: React.FC<Props> = ({ children, title }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitial, setIsInitial] = useState(true);

  const handleToggle = (): void => {
    setIsInitial(false);
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <FaqDropdownContainer onClick={handleToggle}>
      <DropDownTitle>
        <DropDownTitleText>
          {title}
        </DropDownTitleText>
        <PlusIcon src={plusIcon} isOpen={isOpen} isInitial={isInitial} />
      </DropDownTitle>

      <FaqDropdownContent isOpen={isOpen} isInitial={isInitial}>{children}</FaqDropdownContent>
       
    </FaqDropdownContainer>
  );
};
