import styled from "styled-components";

export const WalletAddressContainer = styled.span`
  display: flex;
  font-weight: 600;
  max-width: 100%;
  font-family: "Roboto Mono", monospace;
`;

export const FirstPart = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const LastPart = styled.span`
  /* Magic number, so middle ellipsis looks nice, depends on the font-family/font-size */
  margin-right: 0.4em;
`;
