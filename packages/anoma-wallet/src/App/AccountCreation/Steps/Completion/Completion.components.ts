import styled from "styled-components/macro";

export const CompletionViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  height: 100%;
`;

export const Header1 = styled.h1`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const BodyText = styled.p`
  text-align: center;
  font-weight: 300;
  color: ${(props) => props.theme.colors.textPrimary};
`;

export const CompletionViewUpperPartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const ButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const ButtonContainer = styled.div`
  width: 120px;
`;

export const ImageContainer = styled.div`
  margin: 0 0 48px;
`;
