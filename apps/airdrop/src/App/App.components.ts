import styled, { createGlobalStyle } from "styled-components";
import {
  ColorMode,
  borderRadius,
  color,
  fontSize,
  spacement,
} from "@namada/utils";
import {
  Accordion,
  Heading,
  Input,
  Loading,
  Text,
  TextProps,
} from "@namada/components";

type GlobalStyleProps = {
  colorMode: ColorMode;
};

// Set global styles for themed control of background color based
// on whether the user is logged in
export const GlobalStyles = createGlobalStyle<GlobalStyleProps>`

body {
  background-color: ${(props) =>
    props.colorMode === "dark"
      ? color("utility1", "main")(props)
      : color("primary", "main")(props)};

  background-image: url(/images/background.svg);
  background-repeat: repeat;
  background-size: 100px 100px;
  background-position-y: 20px;
}

.toast-enter-active {
  z-index: 9999;
}

.failure-toast {
  min-width: 200px;
  padding: 10px 20px;
  border-radius: 5px;
  background-color: ${(props) => props.theme.colors.utility3.highAttention};
  box-shadow: 0 0 7px rgba(211, 47, 47, 0.5);
  color: #fff;
  text-align: center;
}
`;

export const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 800px;
  margin: 0 auto;
  transition: all 0.3s linear;
  box-sizing: border-box;
`;

export const AppContainerHeader = styled.div`
  align-self: flex-start;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  padding: ${spacement(2)} ${spacement(12)};
  position: relative;
  width: 100%;
  z-index: 100;

  & > button {
    margin: 10px 0 0 0;
  }

  & a {
    color: ${color("utility1", "main")};
    text-decoration: none;
  }
`;

export const Logo = styled.div``;

// Common.components
export const Breadcrumb = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: ${(props) => props.theme.colors.utility2.main};

  &.active {
    color: ${(props) => props.theme.colors.primary.main};
  }
`;

// Main.components
export const MainContainer = styled.div<{ blurred: boolean }>`
  width: 100%;
  transition: all 500ms var(--ease-out-circ);
  filter: blur(${(props) => (props.blurred ? "10px" : "0px")});
  display: flex;
  flex-direction: column;
  position: relative;
`;

export const MainHeader = styled.div`
  margin-top: ${spacement(12)};
  h1 {
    line-height: 1em;
    text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000,
      1px 1px 0 #000;
  }

  span {
    color: ${(props) => props.theme.colors.primary.main};
  }
`;

export const MainSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${color("primary", "main")};
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility1.main20};
  width: 620px;
  height: 620px;
  margin: ${spacement(12)} auto 0;
  background: ${color("primary", "main")};
  border-radius: 50%;
  border: ${spacement(6)} solid ${color("utility3", "black")};
  text-align: center;
  position: relative;
  z-index: 20;
`;

export const ButtonContainer = styled.div`
  max-width: 280px;
  margin: 0 auto;
`;

export const CallToActionStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacement(1)};
  margin: 0 auto;
  max-width: 360px;

  button {
    font-weight: 700;
    margin-top: ${spacement(1.5)};
  }
`;

export const SmallWarning = styled.div`
  font-size: 12px;
`;

export const MainTopSection = styled.section`
  position: relative;
  padding-bottom: ${spacement(24)};
  max-width: 100%;
`;

export const PoolContainer = styled.div`
  position: absolute;
  z-index: 10;
  top: 504px;
  left: calc(50% - 605px);

  svg {
    display: block;
  }
`;

export const PoolTopLayerContainer = styled.div`
  position: absolute;
  z-index: 30;
  top: 10px;
  left: calc(50% - 378px);
  pointer-events: none;
  overflow: visible;
`;

export const ObjectsContainer = styled.div`
  height: 100%;
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  width: 100%;
  z-index: 0;
`;

export const GithubLoading = styled(Loading)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

export const EligibilityPanel = styled.div`
  max-width: 405px;
  margin: 0 auto;
`;

export const IconContainer = styled.i<{ top: number; left: number }>`
  position: absolute;
  left: calc(50% + ${(props) => props.left}px);
  top: ${(props) => props.top}px;
`;

export const MainSectionTime = styled.div`
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const MainSectionButton = styled.div`
  align-self: center;
`;

export const Divider = styled.div`
  width: 190px;
  align-self: center;
  border-bottom: 1px solid ${(props) => props.theme.colors.utility2.main};
`;

export const MainFooter = styled.div`
  color: ${color("utility1", "main")};
  display: flex;
  flex-direction: column;
  margin: ${spacement(18)} auto ${spacement(36)};
  max-width: 720px;
  text-align: center;
  width: 100%;
`;

export const MainModal = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  width: 100%;
  & > button {
    margin: 10px 0;
  }
`;

export const ModalButtonContainer = styled.div`
  text-align: center;

  & > button {
    margin-bottom: ${spacement(1.5)};
  }
`;

export const ModalButtonText = styled(Text)<{ disabled: boolean } & TextProps>`
  color: ${(props) =>
    props.theme.colors[props.themeColor || "primary"][
      props.disabled ? "main20" : "main"
    ]};
`;

export const KeplrButtonContainer = styled.div`
  color: ${(props) => props.theme.colors.utility2.main};
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;

  & > button {
    margin: 10px 0;
  }
`;

//Eligibility.components
export const EligibilityHeader = styled.header`
  border-bottom: 1px solid ${color("primary", "main40")};
  padding: ${spacement(4)} ${spacement(5)};
`;

export const EligibilitySectionWrapper = styled.div`
  box-sizing: border-box;
  padding: ${spacement(8)};
`;

export const EligibilitySection = styled.div`
  display: flex;
  gap: 20px;
  color: ${(props) => props.theme.colors.utility1.main};
  justify-content: space-between;
  flex-direction: column;

  & h1 {
    text-align: left;
  }

  & > button {
    align-self: center;
  }
`;

export const EligibilityCriteria = styled.div`
  padding: 20px;
  background-color: ${(props) => props.theme.colors.utility2.main};
`;

export const EligibiltyList = styled.ul`
  margin: ${spacement(2)} 0 ${spacement(4)};
  padding: 0 0 0 ${spacement(5)};

  & > li {
    padding: 5px 0;
  }
`;

export const AnotherWaysContainer = styled.div`
  border-radius: ${borderRadius("md")};
  background-color: ${color("utility1", "main")};
  border: 1px solid ${color("primary", "main")};
  padding: ${spacement(9)} ${spacement(24)} ${spacement(10)};

  & > h2 {
    text-align: left;
  }
`;

export const AnotherWaysButtons = styled.div<{ columns?: string }>`
  column-gap: ${spacement(1)};
  display: grid;
  align-items: start;
  grid-template-columns: ${(props) => props.columns || "1fr 1fr 1fr"};
  margin-bottom: ${spacement(6)};
  margin-top: 20px;
  row-gap: ${spacement(6)};

  & > button {
    margin: 0;
    font-size: ${fontSize("base")};
    padding-top: ${spacement(4)};
    padding-bottom: ${spacement(4)};
  }

  /* TODO: temporary workaround for text height*/
  & > button > span {
    height: auto;
  }
`;

export const ClaimsSectionSignature = styled.div``;

export const GithubFooter = styled.div``;

export const ExtensionInfo = styled.div`
  margin-top: 20px;
  padding: 20px;
  border-radius: ${borderRadius("lg")};
  box-sizing: border-box;
  border: 1px solid ${color("primary", "main")};
`;

// AirdropConfirmation.components
export const AirdropConfirmationContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

export const AirdropConfirmationMainSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${color("primary", "main")};
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility1.main20};
  width: 720px;
  height: 720px;
  margin: ${spacement(12)} auto 0;
  background: ${color("primary", "main")};
  border-radius: 50%;
  border: ${spacement(8)} solid ${color("utility3", "black")};
  text-align: center;
  position: relative;
  z-index: 20;
`;

export const AirdropConfirmationPool = styled(PoolContainer)`
  top: 540px;
`;

export const AirdropConfirmationPoolTop = styled(PoolTopLayerContainer)`
  top: 46px;
  z-index: 10;
`;

export const AirdropConfirmationObjectsContainer = styled(ObjectsContainer)`
  top: 60px;
  height: calc(100% - 60px);
`;

export const AirdropConfirmationInput = styled(Input)`
  color: ${color("utility1", "main")};
  & input {
    background-color: ${color("primary", "main")};
    border: 1px solid ${color("utility1", "main")};
    padding-top: ${spacement(3)};
    padding-bottom: ${spacement(3)};
  }

  & input:focus {
    border: 1px solid ${color("utility1", "main")};
  }

  & rect,
  path {
    stroke: ${color("utility1", "main")};
    fill: ${color("primary", "main")};
  }
`;

export const AirdropConfirmationAccordion = styled(Accordion)`
  margin-top: ${spacement(6)};
  border: 1px solid ${color("utility1", "main")};
`;

export const AirdropConfirmationHeading = styled(Heading)`
  line-height: 1em;
`;

export const AirdropConfirmationSection = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const AirdropBreakdownSection = styled.div`
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 1140px;
  align-self: center;
  margin-top: ${spacement(17)};
`;

export const AnotherWaysSection = styled.div`
  width: 100%;
  max-width: 1140px;
  align-self: center;
  margin: ${spacement(10)} 0;
`;

export const Table = styled.div`
  display: flex;
  gap: ${spacement(2)};
  flex-direction: column;
  width: 100%;
  font-size: ${fontSize("sm")};
`;
export const TableHeader = styled.div`
  display: flex;
  align-items: center;
  padding: ${spacement(4)} ${spacement(6)};
  background-color: ${color("utility1", "main")};
  color: ${color("primary", "main")};
  border-radius: ${borderRadius("sm")};
`;

export const TableRow = styled.div<{ height?: string }>`
  display: flex;
  align-items: center;
  border: 1px solid ${color("utility1", "main")};
  border-radius: ${borderRadius("sm")};
  min-height: ${(props) => props.height || "auto"};
  padding: ${spacement(2)} ${spacement(6)};
`;
export const TableCell = styled.div<{
  width: string;
  align?: "left" | "right" | "center";
}>`
  width: ${(props) => props.width};
  text-align: ${(props) => props.align || "left"};
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const Warning = styled.div<{
  width?: string;
  top: string;
  left: string;
}>`
  z-index: 20;
  width: ${(props) => props.width || "auto"};
  position: absolute;
  top: ${(props) => props.top};
  left: ${(props) => props.left};
  display: flex;
  font-size: ${fontSize("sm")};
  flex-direction: column;
  border-radius: ${borderRadius("md")};
  padding: ${spacement(5)} ${spacement(2)};
  align-items: center;
  color: ${color("primary", "main")};
  background-color: ${color("utility1", "main")};

  & > svg {
    max-width: 60px;
    margin: 0 auto ${spacement(2)};
  }

  & ul {
    padding-left: ${spacement(5)};
    margin: 0;

  & li {
    padding: ${spacement(2)} 0;
    fontsize: ${fontSize("sm")};
  }
`;

export const WarningIconContainer = styled.div`
  width: 60px;
`;

// TSEligibility.components
//
export const TSEligibilityContainer = styled.div`
  width: 100%;
  color: ${(props) => props.theme.colors.utility2.main};
  & > button {
    margin: 10px 0 0 0;
  }
`;

// Mobile
//
export const MobileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const MobileMainSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${color("primary", "main")};
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility1.main20};
  width: 620px;
  height: 620px;
  top: calc(50% - 310px);
  left: calc(50% - 310px);
  background: ${color("primary", "main")};
  border-radius: 50%;
  border: ${spacement(6)} solid ${color("utility3", "black")};
  text-align: center;
  position: fixed;
  z-index: 20;

  @media (max-width: 767px) {
    position: relative;
    width: 500px;
    height: 500px;
    top: 0;
    left: 0;

    & h1 {
      font-size: ${fontSize("6xl")};
    }
  }
`;

export const MobileLogo = styled.div`
  display: flex;
  gap: ${spacement(4)};
  margin-top: ${spacement(4)};

  @media (max-width: 767px) {
    margin-bottom: ${spacement(10)};
    flex-direction: column;
    align-items: center;
  }
`;

export const TrustedSetupList = styled.ol`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${spacement(5)};
`;

export const TrustedSetupHeader = styled.header`
  max-width: 75%;

  p {
    font-size: 18px;
    margin-top: ${spacement(2)};
  }
`;

export const TrustedSetupListItem = styled.li`
  border-radius: ${borderRadius("md")};
  border: 1px solid ${color("primary", "main")};
  color: ${color("primary", "main")};
  font-size: 18px;
  list-style: none;
  padding: ${spacement(6)};

  i {
    font-size: 22px;
  }

  a {
    color: currentColor;
    font-weight: 700;
    text-decoration: none;
    transition: color 150ms ease-out;

    &:hover {
      color: ${color("secondary", "main")};
    }
  }
`;

export const CheckEligibilityContainer = styled.div`
  padding: ${spacement(6)} ${spacement(7)};

  input::placeholder {
      color: ${color("primary", "main40")};
    }
  }
`;

export const CheckEligibilityButton = styled.div`
  position: absolute;
  right: ${spacement(6)};
  top: ${spacement(3)};
`;
