import { ThemedScrollbarContainer } from "App/AccountOverview/DerivedAccounts/DerivedAccounts.components";
import styled from "styled-components";

export const StakingOverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: center;
  width: 100%;
  margin: 16px 0 16px;
  color: ${(props) => props.theme.colors.utility2.main};
  background-color: ${(props) => props.theme.colors.utility1.main80};
`;

export const ValidatorsContainer = styled(ThemedScrollbarContainer)`
  width: 700px;
  height: 100%;
  max-height: 412px;
  box-sizing: border-box;
  font-size: 14px;
  margin: 12px 0;
  overflow-x: hidden;
`;
