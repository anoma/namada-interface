import styled from "styled-components/macro";

export const LoginViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  width: 100%;

  & > label {
    width: 100%;

    & > div > input {
      width: 92%;
    }
  }
`;
