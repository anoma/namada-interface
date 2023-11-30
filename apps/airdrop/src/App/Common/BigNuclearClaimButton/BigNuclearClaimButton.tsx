import { useLayoutEffect, useRef } from "react";
import {
  ButtonContainer,
  TextContainer,
  TextContainerLeft,
  TextContainerRight,
  ButtonText,
  InactiveButtonContainer,
  Edge,
  TheButtonContainer,
  TheBigButton,
} from "./BigNuclearClaimButton.components";
import { ReactComponent as TheButton } from "./button.svg";

import gsap, { Bounce, Quad, Quint } from "gsap";

type BigNuclearClaimButton = {
  valid: boolean;
  onClick: () => void;
};

export const BigNuclearClaimButton = ({
  valid,
  onClick,
}: BigNuclearClaimButton): JSX.Element => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (!valid) return;

    const tl = gsap.timeline();

    gsap.context(() => {
      tl.set("svg", { visibility: "visible" });

      tl.to(
        ".left",
        { xPercent: "-=100", duration: 0.75, ease: Quad.easeOut },
        0
      );

      tl.to(
        ".right",
        { xPercent: "+=100", duration: 0.75, ease: Quad.easeOut },
        0
      );

      tl.fromTo(".the-button", { y: "+=180" }, { y: 0, ease: Quint.easeOut });

      tl.fromTo(
        ".yellow-button",
        { scaleY: 0, transformOrigin: "center bottom" },
        {
          scaleY: 1,
          ease: Bounce.easeOut,
          yoyoEase: Quad.easeOut,
          duration: 0.25,
        },
        "-=0.25"
      );
    }, [buttonRef]);

    return () => {
      tl.reverse();
    };
  }, [valid]);

  return (
    <TheBigButton ref={buttonRef} disabled={!valid} onClick={onClick}>
      <ButtonContainer>
        <Edge />
        <Edge right />
        <InactiveButtonContainer>
          <TextContainer>
            <TextContainerLeft className="left">
              <ButtonText>Complete Fields to Activate Claim</ButtonText>
            </TextContainerLeft>
            <TextContainerRight className="right">
              <ButtonText>Complete Fields to Activate Claim</ButtonText>
            </TextContainerRight>
          </TextContainer>
        </InactiveButtonContainer>
      </ButtonContainer>
      <TheButtonContainer className="the-button">
        <TheButton />
      </TheButtonContainer>
    </TheBigButton>
  );
};
