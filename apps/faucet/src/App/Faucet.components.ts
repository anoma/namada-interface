import styled from "styled-components";

export const FaucetFormContainer = styled.div`
  flex-direction: column;
  justify-content: start;
  align-items: center;
  padding: 32px 40px;

  @media screen and (max-width: 860px) {
    padding: 32px 24px;
  }
`;

export const InputContainer = styled.div`
  margin: 12px 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 13px 0 0 0;
`;

export const PreFormatted = styled.pre`
  font-size: 12px;
  background-color: ${(props) => props.theme.colors.utility2.main20};
  border-radius: 4px;
  padding: 4px;
  overflow-x: scroll;
`;

export const FormStatus = styled.div`
  font-family: "Space Grotesk", sans-serif;
  color: white;
  font-size: 12px;
  padding: 0 0 8px;
`;
