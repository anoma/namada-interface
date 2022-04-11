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

export const InputWithButtonContainer = styled.div`
  position: relative;

  button {
    border: none;
    width: 24px;
    height: 24px;
    padding: 0;
    position: absolute;
    right: 0;
    top: 30px;
    background: #fff;

    &:active {
      background: none;
      fill: ${(props) => props.theme.colors.buttonBackground2};
    }
  }
`;

export const QrReaderContainer = styled.div`
  padding-top: 20px;
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
