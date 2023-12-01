import { Image, ImageName, Stack } from "@namada/components";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { claimAtom, confirmationAtom } from "../../state";
import {
  DomainWarning,
  PageHeaderContainer,
  PageHeaderLink,
  PageHeaderStartOver,
  TermsOfServiceButton,
} from "./PageHeader.components";
import { WarningIcon } from "App/Icons/WarningIcon";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ExternalPageIcon } from "App/Icons/ExternalPageIcon";

type PageHeaderProps = {
  showStartOver: boolean;
  showTermsOfService: boolean;
  showDomainWarning: boolean;
  showBackToClaim: boolean;
  yellowLogo: boolean;
};

export const PageHeader = ({
  showStartOver,
  showTermsOfService,
  showDomainWarning,
  showBackToClaim,
  yellowLogo,
}: PageHeaderProps): JSX.Element => {
  const headerRef = useRef<HTMLDivElement>(null);
  const [, setClaimState] = useAtom(claimAtom);
  const [, setConfirmationState] = useAtom(confirmationAtom);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    gsap.context(() => {
      const tl = gsap.timeline({ repeat: 3, repeatDelay: 3 });
      tl.fromTo(
        ".domain-warning",
        { x: -5 },
        { x: 5, repeat: 10, duration: 0.02 }
      );
    }, [headerRef]);
  }, []);

  return (
    <PageHeaderContainer
      ref={headerRef}
      themeColor={yellowLogo ? "primary" : "utility1"}
    >
      {showStartOver && <span />}

      <Stack as="a" gap={6} direction="horizontal">
        <Image
          imageName={ImageName.LogoMinimal}
          styleOverrides={{ width: "50px" }}
          forceLightMode={!yellowLogo}
        />
        <Image
          imageName={ImageName.Logo}
          styleOverrides={{ width: "180px" }}
          forceLightMode={!yellowLogo}
        />
      </Stack>

      {showDomainWarning && (
        <DomainWarning className="domain-warning">
          <i>
            <WarningIcon />
          </i>
          NOTE: The only way to claim is via:{" "}
          <strong>https://rpgfdrop.namada.net</strong>
        </DomainWarning>
      )}

      {showStartOver && (
        <PageHeaderLink
          onClick={() => {
            navigate("/");
            setClaimState(null);
            setConfirmationState(null);
          }}
        >
          <PageHeaderStartOver
            themeColor={yellowLogo ? "primary" : "utility1"}
          />{" "}
          <span>Start over</span>
        </PageHeaderLink>
      )}

      {showBackToClaim && (
        <PageHeaderLink
          onClick={() => {
            navigate("/");
          }}
        >
          <TermsOfServiceButton>
            Back to Claim
            <i>
              <ExternalPageIcon />
            </i>
          </TermsOfServiceButton>
        </PageHeaderLink>
      )}

      {showTermsOfService && (
        <PageHeaderLink
          onClick={() => navigate("/terms-of-service")}
          target="_blank"
          rel="noreferrer nofollow"
        >
          Terms of Service
        </PageHeaderLink>
      )}
    </PageHeaderContainer>
  );
};
