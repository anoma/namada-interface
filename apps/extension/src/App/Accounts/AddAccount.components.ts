import styled from "styled-components";

export const AddAccountContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 0 12px;
  box-sizing: border-box;
`;

export const AddAccountForm = styled.div`
  margin: 0 0 8px;
  box-sizing: border-box;

  input {
    width: 92%;
  }
`;

export const InputContainer = styled.div`
  margin: 12px 0;
`;

export const Bip44PathContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: start;
  align-items: center;
`;

export const Bip44PathDelimiter = styled.span`
  height: 1px;
  padding: 0 4px;
  font-size: 10px;
  font-family: "Space Grotesk", sans-serif;
  color: ${(props) => props.theme.colors.utility2.main60};
`;

export const Bip44Path = styled.div`
  font-family: "Space Grotesk", sans-serif;
  font-size: 13px;
  color: ${(props) => props.theme.colors.utility1.main60};

  & > span {
    color: ${(props) => props.theme.colors.utility1.main20};
  }
`;

export const Bip44Input = styled.input`
  background-color: ${(props) => props.theme.colors.utility1.main70};
  border: 1px solid ${(props) => props.theme.colors.primary.main60};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.utility2.main};
  font-weight: 500;
  margin-top: 10px;
  padding: 0.875em 1em;
  width: 20px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  font-family: "Space Grotesk", sans-serif;
  color: ${(props) => props.theme.colors.utility2.main60};

  & > p {
    padding: 0 0 4px;
    margin: 0;
  }
`;

export const Bip44Error = styled.div`
  font-family: "Space Grotesk", sans-serif;
  color: ${(props) => props.theme.colors.utility3.highAttention};
  font-size: 12px;
  padding: 4px 0;
`;

export const FormStatus = styled.div`
  font-family: "Space Grotesk", sans-serif;
  color: ${(props) => props.theme.colors.utility2.main};
  font-size: 12px;
  padding: 0 0 8px;
`;

export const FormError = styled.div`
  font-family: "Space Grotesk", sans-serif;
  color: ${(props) => props.theme.colors.utility3.highAttention};
  font-size: 12px;
  padding: 0 0 8px;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;

  & > button {
    flex: 1;
  }
`;
