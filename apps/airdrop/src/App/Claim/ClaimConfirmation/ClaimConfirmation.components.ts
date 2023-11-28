import { borderRadius, color, spacement } from "@namada/utils";
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
  margin-bottom: ${spacement(5)};

  h1 {
    font-weight: 500 !important;
  }
`;

export const ClaimSectionContainer = styled.section`
  padding: ${spacement(8)} ${spacement(9)};
  border-radius: ${borderRadius("md")};
  border: 1px solid ${color("primary", "main")};
`;

export const TermsContainer = styled.footer`
  margin-top: ${spacement(4)};
`;

export const InputActionButton = styled.span`
  position: absolute;
  right: ${spacement(4)};
  top: 50%;
  transform: translateY(-50%);
  width: 220px;
  z-index: 100;
`;

export const ButtonContainer = styled.footer`
  margin: ${spacement(12)} 0;
`;
