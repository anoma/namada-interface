import styled from "styled-components";

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  font-size: 16px;
  height: 42px;
  padding: 0 16px;
  color: ${(props) => props.theme.colors.utility2.main80};
  background-color: ${(props) => props.theme.colors.utility1.main80};
  border: 1px solid ${(props) => props.theme.colors.primary.main};
  border-radius: 12px;
`;

export const InputFeedback = styled.div`
  font-size: 12px;
  margin-top: 4px;
  &.warning {
    color: ${(props) => props.theme.colors.primary.main};
  }
`;

export const InputContainer = styled.div`
  width: 100%;
  height: 46px;
  margin: 0 0 24px;

  &.medium {
    height: 69px;
  }

  &.long {
    height: 104px;
  }
`;

export const Header5 = styled.h5`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const ErrorFeedback = styled.div`
  color: ${(props) => props.theme.colors.utility3.highAttention};
`;
