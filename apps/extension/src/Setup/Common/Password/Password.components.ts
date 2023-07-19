import styled from "styled-components";

/**
 * TODO: Add onBlur callback to @namada/components/Input to avoid
 * defining it below:
 */
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

export const RecoveryPhraseLengthRadioButton = styled.input`
  color: ${(props) => props.theme.colors.utility2.main80};
`;

export const RadioButtonLabel = styled.label`
  color: ${(props) => props.theme.colors.utility2.main80};
`;

export const RecoveryPhraseLengthRadioButtonContainer = styled.div`
  display: flex;
`;

export const RecoveryPhraseLengthRadioButtonsContainer = styled.div`
  display: flex;
`;

export const RecoveryPhraseLengthContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
`;
