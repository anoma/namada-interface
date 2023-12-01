import { color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const PageFooterContainer = styled.footer`
  text-transform: uppercase;
  font-size: ${fontSize("3xl")};
  color: ${color("primary", "main")};
  padding: ${spacement(12)} 0;
  background-color: black;
`;

export const PageFooterContent = styled.div`
  align-items: baseline;
  display: flex;
  font-weight: 500;
  justify-content: space-between;
  margin: 0 auto;
  max-width: 720px;

  a {
    font-size: 0.75em;
    color: inherit;
    text-decoration: none;
    transition: color 100ms ease-out;
    display: inline-flex;
    align-items: center;

    &:hover {
      color: ${color("secondary", "main")};
    }
  }

  .external-icon {
    width: 36px;
    line-height: 0;
    display: inline-block;
  }
`;
