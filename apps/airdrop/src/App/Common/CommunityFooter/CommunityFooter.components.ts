import { spacement } from "@namada/utils";
import styled from "styled-components";

export const CommunityFooterWrapper = styled.footer`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  max-width: 1114px;
  margin: 0 auto ${spacement(30)};
`;
