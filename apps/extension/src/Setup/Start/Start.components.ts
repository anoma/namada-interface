import { color, spacement } from "@namada/utils";
import styled from "styled-components";

export const LogoContainer = styled.div`
  max-width: 244px;
  margin: ${spacement(7)} auto ${spacement(15)};
`;

export const HeaderContainer = styled.header`
  color: ${color("primary", "main")};
  margin-bottom: ${spacement(8)};
`;
