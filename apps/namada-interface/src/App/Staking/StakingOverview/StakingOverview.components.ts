import styled from "styled-components";

export const StakingOverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  margin: 16px 0 16px;
  overflow-y: scroll;
  color: ${(props) => props.theme.colors.utility2.main};
  background-color: ${(props) => props.theme.colors.utility1.main80};
`;

export const StakingBalances = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(150px, 30%) 1fr;
`;
export const StakingBalancesLabel = styled.div``;

export const StakingBalancesValue = styled.div``;
