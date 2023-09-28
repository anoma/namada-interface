import styled from "styled-components";

export const FaucetFormContainer = styled.div`
  flex-direction: column;
  justify-content: start;
  align-items: center;
  margin: 48px;
`;

export const InputContainer = styled.div`
  margin: 12px 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 36px 0;
`;

export const Address = styled.code`
  font-size: 12px;
  background-color: ${(props) => props.theme.colors.utility1.main20};
  border-radius: 4px;
  padding: 4px;
`;

export const FormError = styled.div`
  font-family: "Space Grotesk", sans-serif;
  color: ${(props) => props.theme.colors.utility3.highAttention};
  font-size: 12px;
  padding: 0 0 8px;
`;

export const FormStatus = styled.div`
  font-family: "Space Grotesk", sans-serif;
  color: white;
  font-size: 12px;
  padding: 0 0 8px;
`;
