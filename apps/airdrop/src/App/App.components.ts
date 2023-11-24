import styled, { createGlobalStyle } from "styled-components";
import {
  ColorMode,
  borderRadius,
  color,
  fontSize,
  spacement,
} from "@namada/utils";

type GlobalStyleProps = {
  colorMode: ColorMode;
};

// Set global styles for themed control of background color based
// on whether the user is logged in
export const GlobalStyles = createGlobalStyle<GlobalStyleProps>`
html, body {
  background-color: ${color("primary", "main")};
  transition: background-color 0.5s ease;
}

body {
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
    color: ${color("utility2", "main")};
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
  border: 1px solid ${(props) => props.theme.colors.utility2.main20};
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
  overflow: hidden;
`;

export const PoolContainer = styled.div`
  position: absolute;
  z-index: 10;
  bottom: 0;
  left: calc(50% - 605px);

  svg {
    display: block;
  }
`;

export const PoolTopLayerContainer = styled.div`
  position: absolute;
  z-index: 30;
  bottom: -89px;
  left: calc(50% - 378px);
  pointer-events: none;
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

export const EligibilityPanel = styled.div`
  max-width: 405px;
  margin: 0 auto;
`;

export const IconContainer = styled.i<{ top: number; left: number }>`
  position: absolute;
  left: calc(50% + ${(props) => props.left}px);
  top: calc(50% + ${(props) => props.top}px);
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
  color: ${color("utility2", "main")};
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

export const TOSToggle = styled.label`
  cursor: pointer;
  display: grid;
  grid-template-columns: ${spacement(8)} auto;
  align-items: start;
  font-size: ${fontSize("sm")};
  color: ${color("primary", "main")};
  gap: ${spacement(2)};
  margin-top: ${spacement(5)};
`;

//Eligibility.components
export const EligibilityContainer = styled.div`
  margin-top: 20px;
  width: 100%;
`;

export const GithubHeader = styled.div`
  & > button {
    margin: 0;
  }
`;

export const GithubBreadcrumb = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 40px;
`;

export const EligibilitySectionWrapper = styled.div`
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility2.main20};
  padding: 20px;
`;

export const EligibilitySection = styled.div`
  display: flex;
  gap: 20px;
  color: ${(props) => props.theme.colors.utility2.main};
  justify-content: space-between;
  & h1 {
    text-align: left;
  }

  & > button {
    align-self: center;
  }
`;

export const ClaimsSection = styled.div`
  display: flex;
  flex-direction: column;

  color: ${(props) => props.theme.colors.utility2.main};
  & > button {
    margin-top: 10px;
    width: 200px;
    align-self: center;
  }
`;

export const AnotherWaysContainer = styled.div`
  margin: 30px;
  background-color: ${(props) => props.theme.colors.utility2.main};
  padding: 20px;
  border-radius: ${borderRadius("md")};

  & > h2 {
    text-align: left;
  }
`;

export const AnotherWaysButtons = styled.div`
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;

  & > button {
    margin: 0;
  }

  /* TODO: temporary workaround for text height*/
  & > button > span {
    height: auto;
  }
`;

export const ClaimsSectionSignature = styled.div``;

export const GithubFooter = styled.div``;

export const AirdropAddress = styled.div`
  display: flex;
  flex-direction: row;

  & > label {
    flex: 1;
  }

  & > button {
    width: 80px;
    align-self: flex-end;
    padding: 10px;
  }
`;

export const ExtensionInfo = styled.div`
  margin-top: 20px;
  padding: 20px;
  box-sizing: border-box;
  border: 1px solid ${(props) => props.theme.colors.utility2.main20};
`;

// AirdropConfirmation.components
export const AirdropConfirmationContainer = styled.div``;

export const AirdropConfirmationHeader = styled.div`
  margin-top: 20px;
  & > button {
    margin: 0;
  }
`;

export const AirdropConfirmationSection = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.utility2.main};
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
