import styled from "styled-components";

export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: 0 40px;
  margin: 20px 0;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.utility2.main60};
`;

export const TransfersContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const TransferRow = styled.div`
  display: flex;
  width: 100%;
  box-sizing: border-box;
  padding 5px;
`;

export const TransferCol = styled.div`
  display: flex;
  &:nth-child(1) {
    min-width: 50px;
  }
  &:nth-child(2) {
    min-width: 30%;
    justify-content: center;
  }
  &:nth-child(3) {
    min-width: 30%;
    justify-content: center;
  }
  &:nth-child(4) {
    min-width: calc(40% - 150px);
    justify-content: center;
  }
  &:nth-child(5) {
    min-width: 100px;
    justify-content: flex-end;
  }
`;
