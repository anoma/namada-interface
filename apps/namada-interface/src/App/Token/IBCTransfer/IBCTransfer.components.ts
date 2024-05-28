import styled from "styled-components";

export const IBCTransferFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.utility2.main60};
`;

export const AddChannelButton = styled.button`
  margin: 0 8px 0 0;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  font-family: "Space Grotesk", sans-serif;
  cursor: pointer;

  & > div > svg > path {
    fill: ${(props) => props.theme.colors.primary.main};
  }
  span {
    padding: 12px;
    color: ${(props) => props.theme.colors.utility2.main};
  }
`;
