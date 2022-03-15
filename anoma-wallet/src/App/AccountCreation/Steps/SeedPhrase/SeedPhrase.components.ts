import styled from "styled-components/macro";

export const AccountInformationViewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  height: 100%;
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

export const Header1 = styled.h1`
  margin: 8px 0;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const BodyText = styled.p`
  font-weight: 300;
  color: ${(props) => props.theme.colors.textPrimary};
`;

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
  padding: 48px 0;
`;

export const SeedPhraseCard = styled.div`
  display: flex;
  align-items: center;
  width: calc(33% - 4px - 4px);
  border: 1px solid ${(props) => props.theme.colors.textSecondary};
  border-radius: 4px;
  padding: 2px 8px;
  margin: 4px;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.titleColor};
`;

export const SeedPhraseContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const SeedPhraseIndexLabel = styled.span`
  margin: 2px 8px 0 0;
  font-size: 11px;
  color: ${(props) => props.theme.colors.textSecondary};
`;

export const ExportSeedPhraseButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;

  width: 100%;
  padding: 32px 0 16px;
`;
