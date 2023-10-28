import styled from "styled-components";

export const ExportSeedPhraseButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 32px 0 16px;
  width: 100%;
`;

export const CopyToClipboard = styled.a`
  border-radius: 4px;
  color: ${(props) => props.theme.colors.primary.main};
  padding: 5px;
  text-decoration: underline;
  transition: "1 sec";

  &:active {
    border: 1px solid ${(props) => props.theme.colors.primary.main};
    color: ${(props) => props.theme.colors.utility2.main80};
    background-color: ${(props) => props.theme.colors.primary.main};
  }
`;
