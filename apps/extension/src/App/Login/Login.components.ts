import { fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const LogoContainer = styled.i`
  max-width: ${spacement(50)};
  margin: ${spacement(8)} auto 0;
  width: 100%;
`;

export const LoginContainer = styled.section`
  label > span:first-child {
    display: block;
    font-size: ${fontSize("xl")};
    text-align: center;
    margin-bottom: ${spacement(4)};
    padding-left: 0;
  }
`;
