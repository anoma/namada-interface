import { fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const SettingsContainer = styled.section`
  width: 100%;
`;

export const SettingsHeader = styled.nav`
  align-items: end;
  display: grid;
  grid-template-columns: auto min-content;
`;

export const ButtonContainer = styled.div`
  align-self: end;
  width: ${spacement(24)};
  button {
    font-size: ${fontSize("sm")};
    padding: 0.5em 0.25em;
  }
`;
