import React, { useState } from "react";
import {
  BottomBorder,
  CallToActionContainer,
  CardContainer,
  InclineArrowIcon,
  LeftBorder,
  RightBorder,
  TopBorder,
} from "./Card.components";
import { Text } from "@namada/components";
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
    <CardContainer href={href} onMouseEnter={onHover} onMouseLeave={onLeave}>
      <TopBorder />
      <RightBorder />
      <BottomBorder />
      <LeftBorder />
      <Text themeColor="utility1">{description}</Text>
      <CallToActionContainer>
        <Text fontSize="2xl" themeColor="utility1">
          {title}
        </Text>
        <InclineArrowIcon
          src={isHovered ? InclineArrowYellow : InclineArrowBlack}
        />
      </CallToActionContainer>
    </CardContainer>
  );
};
