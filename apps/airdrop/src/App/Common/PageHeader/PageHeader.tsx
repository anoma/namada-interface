import { Image, ImageName, Stack } from "@namada/components";
import { StartOver } from "App/Icons/StartOver";
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { claimAtom, confirmationAtom } from "../../state";
import { PageHeaderContainer, PageHeaderLink } from "./PageHeader.components";

type PageHeaderProps = {
  showStartOver: boolean;
  showTermsOfService: boolean;
  yellowLogo: boolean;
};

export const PageHeader = ({
  showStartOver,
  showTermsOfService,
  yellowLogo,
}: PageHeaderProps): JSX.Element => {
  const [, setClaimState] = useAtom(claimAtom);
  const [, setConfirmationState] = useAtom(confirmationAtom);
  const navigate = useNavigate();

  return (
    <PageHeaderContainer themeColor={yellowLogo ? "primary" : "utility1"}>
      {showStartOver && <span />}

      <Stack
        as="a"
        gap={6}
        direction="horizontal"
        href="https://namada.net"
        target="_blank"
        rel="nofollow noreferrer"
      >
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

      {showStartOver && (
        <PageHeaderLink
          onClick={() => {
            navigate("/");
            setClaimState(null);
            setConfirmationState(null);
          }}
        >
          <StartOver /> <span>Start over</span>
        </PageHeaderLink>
      )}

      {showTermsOfService && (
        <PageHeaderLink href="#" target="_blank" rel="noreferrer nofollow">
          Terms of Service
        </PageHeaderLink>
      )}
    </PageHeaderContainer>
  );
};
