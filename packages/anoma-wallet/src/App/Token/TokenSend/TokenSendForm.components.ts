import styled from "styled-components/macro";

export const TokenSendFormContainer = styled.div`
  width: 100%;
  padding: 8px 0;

  p {
    padding: 4px 0;
    margin: 0;
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  padding: 20px 0;

  &:last-child {
    padding-bottom: 0;
  }

  input,
  textarea {
    width: 92%;
  }
`;

export const ButtonsContainer = styled.div`
  width: 100%;
  padding: 0;

  button {
    margin: 20px 0;
  }
`;

export const StatusContainer = styled.div`
  width: 100%;
`;

export const StatusMessage = styled.p`
  font-size: 14px;
`;
