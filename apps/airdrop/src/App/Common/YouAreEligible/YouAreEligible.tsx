import { ActionButton, Heading, Stack } from "@namada/components";
import { CheckedIcon } from "App/Icons/CheckedIcon";
import { WalletAddress } from "../WalletAddress";
import {
  IconContainer,
  Panel,
  WalletOrAddressContainer,
  YouAreEligibleContainer,
  YouAreEligibleMessage,
} from "./YouAreEligible.component";
import { useLayoutEffect, useRef } from "react";
import gsap, { Expo, Quad } from "gsap";

type YouAreEligibleType = {
  title: string;
  accountOrWallet: string;
  onClaim: () => void;
};

export const YouAreEligible = ({
  title,
  accountOrWallet,
  onClaim,
}: YouAreEligibleType): JSX.Element => {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    gsap.context(() => {
      const tl = gsap.timeline();

      tl.set(".message", { x: "+=200" });

      tl.fromTo(
        ".icon",
        { scale: 0, rotateZ: "-20deg" },
        { scale: 1, duration: 1, rotateZ: 0, ease: Expo.easeOut }
      );

      tl.fromTo(
        ["h1", "p"],
        { opacity: 0, y: "+=10" },
        { opacity: 1, y: 0, ease: Expo.easeOut, stagger: 0.1, duration: 1.5 },
        0.25
      );

      tl.to(".message", { x: 0, ease: Expo.easeOut }, "-=0.75");

      tl.fromTo(
        ".panel",
        { opacity: 0 },
        { opacity: 1, duration: 0.25, ease: Quad.easeOut },
        "-=0.6"
      );
    }, [containerRef]);
  }, []);

  return (
    <YouAreEligibleContainer ref={containerRef}>
      <YouAreEligibleMessage className="message">
        <IconContainer className="icon">
          <CheckedIcon />
        </IconContainer>
        <Heading size="4xl" level="h1" themeColor="utility1">
          You are Eligible
        </Heading>
        <p>Congrats you are eligible for the Namada RPGF Drop!</p>
      </YouAreEligibleMessage>
      <Panel className="panel">
        <WalletOrAddressContainer>
          <Stack gap={1}>
            <span>{title}:</span>
            <WalletAddress value={accountOrWallet} />
          </Stack>
          <ActionButton
            onClick={onClaim}
            variant="secondary"
            hoverColor="primary"
          >
            Proceed to Claim
          </ActionButton>
        </WalletOrAddressContainer>
      </Panel>
    </YouAreEligibleContainer>
  );
};
