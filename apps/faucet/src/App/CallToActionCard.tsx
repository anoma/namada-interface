import React, { useState } from "react";
import {
  BottomBorder,
  CallToActionContainer,
  CardContainer,
  InclineArrowIcon,
  LeftBorder,
  RightBorder,
  TopBorder,
  CardDescription,
  CardHeading
} from "./Card.components";
import InclineArrowYellow from "../../public/incline-arrow-yellow.svg";
import InclineArrowBlack from "../../public/incline-arrow-black.svg";

type Props = {
  description: string;
  title: string;
  href: string;
};
export const CallToActionCard: React.FC<Props> = ({
  description,
  title,
  href,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const onHover = (): void => {
    setIsHovered(true);
  };

  const onLeave = (): void => {
    setIsHovered(false);
  };

  return (
    <CardContainer href={href} onMouseEnter={onHover} onMouseLeave={onLeave} target="_blank">
      <TopBorder />
      <RightBorder />
      <BottomBorder />
      <LeftBorder />
      <CardDescription>{description}</CardDescription>
      <CallToActionContainer>
        <CardHeading>{title}</CardHeading>
        <InclineArrowIcon
          src={isHovered ? InclineArrowYellow : InclineArrowBlack}
        />
      </CallToActionContainer>
    </CardContainer>
  );
};
