import { borderRadius, color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const ClaimsSection = styled.div`
  color: ${color("primary", "main")};
  display: flex;
  flex-direction: column;
  margin-bottom: ${spacement(10)};

  input {
    border-width: 2px;
    border-radius: 10px;
    &::placeholder {
      color: ${color("primary", "main40")};
    }
  }
`;

export const ClaimHeading = styled.header`
  padding: ${spacement(4)} ${spacement(6)};
  background: ${color("primary", "main")};
  border-radius: ${borderRadius("md")};

  h1 {
    font-weight: 500 !important;
  }
`;

export const ClaimSectionContainer = styled.section<{ active: boolean }>`
  padding: ${spacement(8)} ${spacement(9)};
  border-radius: ${borderRadius("md")};
  border: 1px solid ${color("primary", "main")};
  opacity: ${(props) => (props.active ? 1 : 0.25)};
  transition: 120ms ease-out opacity;

  label {
    color: ${color("primary", "main")};
  }
`;

export const ClaimInputWrapper = styled.div`
  & input {
    padding-right: ${spacement(26)};
  }
`;

export const TermsContainer = styled.footer`
  margin-top: ${spacement(4)};
`;

export const InputActionButton = styled.span`
  position: absolute;
  right: ${spacement(4)};
  top: 50%;
  transform: translateY(-50%);
  z-index: 100;
`;

export const ButtonContainer = styled.div`
  margin: ${spacement(5)} 0 ${spacement(8)};
`;

export const NonceContainer = styled.div`
  input {
    background-color: ${color("utility1", "main80")};
    color: ${color("primary", "main")};
  }
`;

export const PasteSignatureContainer = styled.div`
  label {
    color: ${color("primary", "main")};
    font-weight: 400;
  }
`;

export const StepHeader = styled.header`
  margin-bottom: ${spacement(4)};
`;

export const ClaimBadge = styled.span`
  background: ${color("utility1", "main")};
  border-radius: 24px;
  color: ${color("primary", "main")};
  font-size: ${fontSize("base")};
  padding: ${spacement(1)} ${spacement(4)};
`;

export const Transition = styled.div`
  width: 150vw;
  height 150vw;
  position: fixed;
  top: -25%;
  left: -25%;
  background: ${color("primary", "main")};
  border-radius: 100%;
  z-index: 1000;

`;
