import styled from "styled-components/macro";

export const AccountOverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 0 40px;
`;

export const InputContainer = styled.div`
  width: 100%;
  justify-content: baseline;
  padding: 20px;

  input {
    width: 96%;
  }
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export const ButtonsWrapper = styled.div`
  display: flex;
  width: 70%;

  & > button {
    flex: 1;
    padding: 4px;
  }
`;
