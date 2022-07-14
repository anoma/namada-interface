import styled from "styled-components/macro";

export const IBCTransferFormContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  box-sizing: border-box;
`;

export const AddChannelButton = styled.button`
  margin: 0 8px 0 0;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  cursor: pointer;

  & > div > svg > path {
    fill: ${(props) => props.theme.colors.buttonBackground2};
  }
  span {
    padding: 12px;
    color: ${(props) => props.theme.colors.titleColor};
  }
`;
