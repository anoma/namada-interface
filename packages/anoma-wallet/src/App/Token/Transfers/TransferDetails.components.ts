import styled from "styled-components/macro";

export const TransferDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const Address = styled.pre`
  background: #f7f7f7;
  width: 95%;
  overflow: auto;
  margin: 0;
  padding: 4px 8px;
  border-radius: 4px;
  scrollbar-width: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  color: #444;
  ::-webkit-scrollbar {
    display: none;
  }
`;
