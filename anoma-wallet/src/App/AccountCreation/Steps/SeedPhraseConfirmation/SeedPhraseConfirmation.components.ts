import styled from "styled-components/macro";

export const AccountInformationViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
`;

export const Header1 = styled.h1`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.textPrimary};
`;
export const Header3 = styled.h3`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.textPrimary};
`;
export const Header5 = styled.h5`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.textPrimary};
`;
export const BodyText = styled.p`
  font-weight: 300;
  color: ${(props) => props.theme.colors.textPrimary};
`;

export const AccountInformationViewUpperPartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;
export const AccountInformationForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  width: 100%;
`;

export const RecoveryPhrase = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 48px 0;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 48px 0;
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  font-size: 16px;
  height: 42px;
  padding: 0 16px;
  border-radius: 999px;
`;
export const InputContainer = styled.div`
  width: 100%;
  height: 92px;
  margin: 0 0 24px;
`;
export const InputFeedback = styled.span`
  font-size: 12px;
  color: red;
`;

export const RecoveryPhraseLengthRadioButton = styled.input``;

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
