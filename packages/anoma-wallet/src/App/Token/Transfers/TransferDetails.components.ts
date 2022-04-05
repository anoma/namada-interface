import styled from "styled-components/macro";

export const TransferDetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  width: 100%;
  height: 100%;
`;

export const Address = styled.pre`
  background: #ddd;
  width: 95%;
  overflow: auto;
  margin: 0;
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 8px;
  scrollbar-width: 0;
  -ms-overflow-style: none;

  ::-webkit-scrollbar {
    display: none;
  }
`;
