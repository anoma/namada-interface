import styled from "styled-components";

export const FaucetFormContainer = styled.form`
  flex-direction: column;
  justify-content: start;
  align-items: center;
  padding: 32px 40px;

  @media screen and (max-width: 860px) {
    padding: 32px 24px;
  }
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
