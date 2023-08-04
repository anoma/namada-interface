import styled from "styled-components";

export const ProposalsContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  height: 100%;
  color: ${(props) => props.theme.colors.utility2.main};
  background-color: ${(props) => props.theme.colors.utility1.main80};
`;

export const ProposalsList = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
`;

export const ProposalCard = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 8px;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.primary.main20};
  cursor: pointer;
`;

export const ProposalCardStatusInfo = styled.div`
  font-size: 12px;
  font-weight: 700;
  padding: 8px;
  border-radius: 8px;
  background-color: ${(props) => props.theme.colors.utility1.main80};

  &.pending {
    color: ${(props) => props.theme.colors.utility1.main40};
  }
  &.passed {
    color: ${(props) => props.theme.colors.utility3.success};
  }
  &.rejected {
    color: ${(props) => props.theme.colors.utility3.highAttention};
  }
`;

export const ProposalCardVoteButtons = styled.div``;

// FIX THAT - aka. try to reuse button
export const ProposalCardVoteButton = styled.button`
  padding: 8px;
  font-weight: 700;
  cursor: pointer;
  border-radius: ${(props) => props.theme.borderRadius.buttonBorderRadius};
  border: none;
  background-color: ${(props) => props.theme.colors.primary.main};
  color: ${(props) => props.theme.colors.utility1.main};
  border: 1px solid ${(props) => props.theme.colors.utility1.main};

  &:disabled {
    opacity: 50%;
    cursor: initial;
  }
  &.inverse {
    background-color: ${(props) => props.theme.colors.utility1.main};
    color: ${(props) => props.theme.colors.primary.main};
    border: 1px solid ${(props) => props.theme.colors.primary.main};
  }
`;

export const ProposalCardStatusContainer = styled.div`
  display: flex;
  flex-basis: auto;
  align-items: center;
  justify-content: space-between;
`;

export const ProposalCardText = styled.span`
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const ProposalCardId = styled.span`
  font-weight: 700;
  margin-right: 4px;
`;

export const ProposalCardVotesContainer = styled.div<{
  yes: number;
  no: number;
}>`
  width: 40px;
  height: 40px;
  background-image: conic-gradient(
    ${(props) => props.theme.colors.primary.main} 0,
    ${(props) => props.theme.colors.primary.main} ${(p) => p.yes}%,
    ${(props) => props.theme.colors.utility1.main80} 0,
    ${(props) => props.theme.colors.utility1.main80} ${(p) => p.no}%
  );
  border-radius: 50%;
`;

export const ProposalCardInfoContainer = styled.div`
  display: flex;
  height: 40px;
  gap: 4px;

  & ${ProposalCardVotesContainer} {
    flex-shrink: 0;
    align-self: center;
  }

  & ${ProposalCardText} {
    flex-grow: 1;
  }
`;

export const ProposalDetailsContainer = styled.dialog`
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 0;
  margin: 0;
  border: none;
  overflow-y: auto;
`;

export const ProposalDetailsContent = styled.div`
  width: 600px;
  padding: 24px;
  background-color: ${(props) => props.theme.colors.primary.main};
  color: ${(props) => props.theme.colors.utility1.main};
`;

export const ProposalDetailsContentMainHeader = styled.h1``;
export const ProposalDetailsContentSubHeader = styled.h3`
  text-transform: capitalize;
`;
export const ProposalDetailsContentParagraph = styled.p``;

export const ProposalDetailsAddresses = styled.div``;
export const ProposalDetailsAddressesHeader = styled.h4`
  margin-bottom: 0px;
`;

export const ProposalDetailsButtons = styled.div`
  display: flex;
  justify-content: center;
  gap 16px;
  margin-top: 16px;
`;
