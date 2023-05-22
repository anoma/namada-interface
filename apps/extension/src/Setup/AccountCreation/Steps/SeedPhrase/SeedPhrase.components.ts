import styled from "styled-components";

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
  color: ${(props) => props.theme.colors.utility2.main};
`;

export const BodyText = styled.p`
  text-align: center;
  width: 100%;
  font-weight: 300;
  color: ${(props) => props.theme.colors.utility2.main80};
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
  background-color: ${(props) => props.theme.colors.utility1.main};
  border-radius: 4px;
  padding: 8px 12px;
  margin: 4px;
  box-sizing: border-box;
  color: ${(props) => props.theme.colors.utility2.main80};
  font-weight: bold;
  user-select: ${() => process.env.NODE_ENV === 'development' ? '' : 'none'};
`;

export const SeedPhraseContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const SeedPhraseIndexLabel = styled.span`
  margin: 2px 8px 0 0;
  font-size: 11px;
  color: ${(props) => props.theme.colors.utility2.main80};
`;

export const SeedPhraseLengthContainer = styled.div`
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: right;
  flex-direction: row;
  margin: 4px 0 12px;
`;

export const SeedPhraseLength = styled.div`
  padding: 0 8px;
`;

export const ExportSeedPhraseButtonsContainer = styled.div`
  display: flex;
  justify-content: center;

  width: 100%;
  padding: 32px 0 16px;
`;

export const CopyToClipboard = styled.a`
  text-decoration: underline;
  padding: 5px;
  color: ${(props) => props.theme.colors.primary.main};
  transition: "1 sec";
  border-radius: 4px;

  &:active {
    border: 1px solid ${(props) => props.theme.colors.primary.main};
    color: ${(props) => props.theme.colors.utility2.main80};
    background-color: ${(props) => props.theme.colors.primary.main};
  }
`;
