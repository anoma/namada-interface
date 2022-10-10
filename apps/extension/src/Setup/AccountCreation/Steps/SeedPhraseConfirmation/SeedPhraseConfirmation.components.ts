import styled from "styled-components";

export const AccountInformationViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
`;

export const Header1 = styled.h1`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const Header5 = styled.h5`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.utility2.main};
`;
export const BodyText = styled.p`
  font-weight: 300;
  color: ${(props) => props.theme.colors.utility2.main80};
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

export const DescriptionAndInputContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  height: 100%;
  width: 100%;
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 24px 0;
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
