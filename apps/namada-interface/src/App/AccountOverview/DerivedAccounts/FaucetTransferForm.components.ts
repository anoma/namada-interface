import styled from "styled-components";

export const FaucetTransferContainer = styled.div`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  margin: 0 20px;
  padding: 20px 0;
  color: ${(props) => props.theme.colors.utility2.main80};
`;

export const FaucetTransferContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  height: 100%;
  color: ${(props) => props.theme.colors.utility2.main80};
`;

export const FaucetButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
`;
