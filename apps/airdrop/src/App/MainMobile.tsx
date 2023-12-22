import { Heading, Image, Stack, Text } from "@namada/components";
import {
  MainHeader,
  MobileContainer,
  MobileLogo,
  MobileMainSection,
} from "./App.components";
import { DesktopIcon } from "./Icons/DesktopIcon";
import { NamadaIcon } from "./Icons/NamadaIcon";

export const MainMobile: React.FC = () => {
  return (
    <MobileContainer>
      <MobileLogo>
        <NamadaIcon />
        <Image
          imageName="Logo"
          styleOverrides={{ width: "240px" }}
          forceLightMode={true}
        />
      </MobileLogo>
      <MobileMainSection>
        <MainHeader>
          <Stack gap={5}>
            <Heading themeColor="utility1" uppercase level={"h1"} size={"7xl"}>
              No<span> Privacy</span>
              <br />
              Without
              <br />
              Public Goods
            </Heading>
            <Text themeColor="utility1" fontSize="xl">
              To check your eligibility please open
              <br /> this page on your desktop
            </Text>
            <i style={{ alignSelf: "center" }}>
              <DesktopIcon />
            </i>
          </Stack>
        </MainHeader>
      </MobileMainSection>
    </MobileContainer>
  );
};
