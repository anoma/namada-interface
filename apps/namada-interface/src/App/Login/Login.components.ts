import styled from "styled-components/macro";

export const LoginViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
  width: 80%;
  margin: 40px 0;
  padding: 20px 0;

  & > label {
    width: 100%;

    & > div > input {
      width: 100%;
    }
  }
`;

export const LoginViewOuterContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export const UnlockingLabel = styled.p`
  color: ${(props) => props.theme.colors.utility2.main};
`;
