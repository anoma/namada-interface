import styled, { css, keyframes } from "styled-components";
import { Text } from "@namada/components";
import React from "react";

export const FaqContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 64px;
  margin-bottom: 80px;
`;

export const FaqDropdownContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${(props) => props.theme.colors.utility3.black};
  cursor: pointer;
  position: relative;
`;

const expand = keyframes`
  from {
    max-height: 0;
  }
  to {
    max-height: 200px; /* Adjust the maximum height as needed */
  }
`;

const collapse = keyframes`
  from {
    max-height: 200px; /* Adjust the maximum height as needed */
  }
  to {
    max-height: 0;
  }
`;
export const FaqDropdownContent = styled.div<{ isOpen: boolean, isInitial: boolean }>`
  overflow: hidden; /* Ensure content doesn't overflow during animation */
  margin-top: 8px;
  ${({ isOpen, isInitial }) => {
    const toggleAnimation = isOpen ? 
    css`
      max-height: 200px;
      animation: ${expand} 0.35s ease-out;
    `: css`
      max-height: 0px;
      animation: ${collapse} 0.35s ease-out;
    `;
    return isInitial ? css`max-height: 0px;` : toggleAnimation
  }}  
`;

export const DropDownTitle = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: start;
`;

export const DropDownTitleText: React.FC = ({ children }) => {
  return (
    <div style={{
      maxWidth: '90%',
    }}>
      <Text themeColor="utility1" fontSize="2xl">{children}</Text>
    </div>
  )
}

const FaqUrlStyle = styled.a`
  color: ${(props) => props.theme.colors.utility3.black};
  &:hover {
    background: ${(props) => props.theme.colors.secondary.main};
  }
`;

interface FaqUrlProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {  
}
export const FaqUrl: React.FC<FaqUrlProps> = ({ ...props }) => {
  // prevent onClick from bubbling up to parent
  return <FaqUrlStyle onClick={(e) => e.stopPropagation()} {...props} />;
}

const rotateAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(45deg);
  }`

const reverseRotateAnimation = keyframes`
  from {
    transform: rotate(45deg);
  }
  to {
    transform: rotate(0deg);
  }`
export const PlusIcon = styled.img<{ isOpen: boolean; isInitial: boolean }>`
  width: 24px;
  ${({ isOpen, isInitial }) => {
    const rotateAnimationCss = isOpen 
    ? css`animation: ${rotateAnimation} 0.2s ease-in-out forwards;` : css`animation: ${reverseRotateAnimation} 0.2s ease-in-out forwards;`;
    return isInitial ? '': rotateAnimationCss;
  }}`;


