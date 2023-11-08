import { spacement } from "@namada/utils";
import styled from "styled-components";

export const SettingsContainer = styled.section`
  width: 100%;
`;

export const SettingsHeader = styled.nav`
  margin-top: ${spacement(4)};
  display: grid;
  grid-template-columns: auto ${spacement(30)};
  align-items: end;
`;
