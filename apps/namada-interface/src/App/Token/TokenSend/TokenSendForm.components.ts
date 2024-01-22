import styled from "styled-components";

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
  padding: 12px 0;

  &:last-child {
    padding-bottom: 0;
  }

  input,
  textarea {
    margin: 0;
    padding: 8px;
    height: 42px;
    width: calc(100% - 20px);
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
      fill: ${(props) => props.theme.colors.primary.main};
    }
  }
`;

export const ButtonsContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0;

  & > a {
    position: absolute;
    left: 0;
  }
`;

export const StatusContainer = styled.div`
  width: 100%;
`;

export const StatusMessage = styled.p`
  font-size: 14px;
`;

export const BackButton = styled.a`
  display: block;
  cursor: pointer;
  & > div > svg {
    width: 50px;
    height: 50px;

    & > path {
      stroke: ${(props) => props.theme.colors.utility2.main60};
      stroke-width: 4px;
      stroke-linecap: square;
    }
  }
`;
